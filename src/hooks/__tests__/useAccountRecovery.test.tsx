import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SECURITY_QUESTIONS } from '../useAccountRecovery';

// Test the hash function logic independently
const hashAnswer = (answer: string): string => {
  const normalized = answer.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

describe('SECURITY_QUESTIONS', () => {
  it('should have at least 8 security questions', () => {
    expect(SECURITY_QUESTIONS.length).toBeGreaterThanOrEqual(8);
  });

  it('should have unique IDs for each question', () => {
    const ids = SECURITY_QUESTIONS.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have non-empty questions', () => {
    SECURITY_QUESTIONS.forEach(q => {
      expect(q.question.length).toBeGreaterThan(10);
      expect(q.question.endsWith('?')).toBe(true);
    });
  });

  it('should have valid ID formats', () => {
    SECURITY_QUESTIONS.forEach(q => {
      expect(q.id).toMatch(/^[a-z]+$/);
    });
  });
});

describe('hashAnswer', () => {
  it('should normalize case', () => {
    expect(hashAnswer('TEST')).toBe(hashAnswer('test'));
    expect(hashAnswer('TeSt')).toBe(hashAnswer('TEST'));
  });

  it('should trim whitespace', () => {
    expect(hashAnswer('  test  ')).toBe(hashAnswer('test'));
    expect(hashAnswer('\n\ttest\n\t')).toBe(hashAnswer('test'));
  });

  it('should produce consistent hashes', () => {
    const hash1 = hashAnswer('my answer');
    const hash2 = hashAnswer('my answer');
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different inputs', () => {
    const hash1 = hashAnswer('answer one');
    const hash2 = hashAnswer('answer two');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty strings', () => {
    expect(hashAnswer('')).toBe('0');
  });

  it('should handle special characters', () => {
    const hash1 = hashAnswer("O'Brien");
    const hash2 = hashAnswer("obrien");
    expect(hash1).not.toBe(hash2);
  });

  it('should handle unicode characters', () => {
    const hash = hashAnswer('Café');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
});

describe('Recovery verification logic', () => {
  const storedQuestions = [
    { questionId: 'pet', answerHash: hashAnswer('Fluffy') },
    { questionId: 'city', answerHash: hashAnswer('New York') },
    { questionId: 'school', answerHash: hashAnswer('Lincoln Elementary') },
  ];

  const verifyAnswers = (
    answers: { questionId: string; answer: string }[],
    stored: { questionId: string; answerHash: string }[]
  ): boolean => {
    if (stored.length === 0) return false;
    
    let correctCount = 0;
    for (const answer of answers) {
      const storedQuestion = stored.find(q => q.questionId === answer.questionId);
      if (storedQuestion && hashAnswer(answer.answer) === storedQuestion.answerHash) {
        correctCount++;
      }
    }
    
    return correctCount >= 2;
  };

  it('should verify correct answers', () => {
    const answers = [
      { questionId: 'pet', answer: 'Fluffy' },
      { questionId: 'city', answer: 'New York' },
    ];
    expect(verifyAnswers(answers, storedQuestions)).toBe(true);
  });

  it('should verify case-insensitive answers', () => {
    const answers = [
      { questionId: 'pet', answer: 'FLUFFY' },
      { questionId: 'city', answer: 'new york' },
    ];
    expect(verifyAnswers(answers, storedQuestions)).toBe(true);
  });

  it('should reject incorrect answers', () => {
    const answers = [
      { questionId: 'pet', answer: 'Wrong' },
      { questionId: 'city', answer: 'Wrong City' },
    ];
    expect(verifyAnswers(answers, storedQuestions)).toBe(false);
  });

  it('should require at least 2 correct answers', () => {
    const oneCorrect = [
      { questionId: 'pet', answer: 'Fluffy' },
      { questionId: 'city', answer: 'Wrong' },
    ];
    expect(verifyAnswers(oneCorrect, storedQuestions)).toBe(false);
  });

  it('should handle empty stored questions', () => {
    const answers = [{ questionId: 'pet', answer: 'Fluffy' }];
    expect(verifyAnswers(answers, [])).toBe(false);
  });

  it('should handle unknown question IDs', () => {
    const answers = [
      { questionId: 'unknown', answer: 'test' },
      { questionId: 'also_unknown', answer: 'test' },
    ];
    expect(verifyAnswers(answers, storedQuestions)).toBe(false);
  });
});

describe('Email validation for backup email', () => {
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.org')).toBe(true);
    expect(validateEmail('user+tag@gmail.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('missing@.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('Backup email verification', () => {
  const verifyBackupEmail = (
    inputEmail: string,
    storedEmail: string | null,
    isVerified: boolean
  ): boolean => {
    return storedEmail?.toLowerCase() === inputEmail.toLowerCase() && isVerified;
  };

  it('should verify matching verified email', () => {
    expect(verifyBackupEmail('user@example.com', 'user@example.com', true)).toBe(true);
  });

  it('should verify case-insensitive', () => {
    expect(verifyBackupEmail('USER@EXAMPLE.COM', 'user@example.com', true)).toBe(true);
  });

  it('should reject unverified email', () => {
    expect(verifyBackupEmail('user@example.com', 'user@example.com', false)).toBe(false);
  });

  it('should reject non-matching email', () => {
    expect(verifyBackupEmail('different@example.com', 'user@example.com', true)).toBe(false);
  });

  it('should handle null stored email', () => {
    expect(verifyBackupEmail('user@example.com', null, true)).toBe(false);
  });
});
