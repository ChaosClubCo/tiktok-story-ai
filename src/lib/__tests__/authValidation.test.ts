import { describe, it, expect } from 'vitest';
import { 
  passwordSchema, 
  emailSchema, 
  signUpSchema, 
  loginSchema, 
  passwordResetSchema 
} from '../authValidation';

describe('passwordSchema', () => {
  it('should reject passwords shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('Ab1!xyz');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('8 characters');
    }
  });

  it('should reject passwords without uppercase letters', () => {
    const result = passwordSchema.safeParse('abcdefg1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('uppercase');
    }
  });

  it('should reject passwords without lowercase letters', () => {
    const result = passwordSchema.safeParse('ABCDEFG1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('lowercase');
    }
  });

  it('should reject passwords without numbers', () => {
    const result = passwordSchema.safeParse('Abcdefgh!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('number');
    }
  });

  it('should reject passwords without special characters', () => {
    const result = passwordSchema.safeParse('Abcdefg1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('special character');
    }
  });

  it('should accept valid passwords', () => {
    const validPasswords = [
      'Password1!',
      'MySecure@Pass123',
      'Complex$Password99',
      'Test!ng123',
      'Str0ng#Password',
    ];

    validPasswords.forEach(password => {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(true);
    });
  });
});

describe('emailSchema', () => {
  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'notanemail',
      '@nodomain.com',
      'missing@.com',
      'spaces in@email.com',
      '',
    ];

    invalidEmails.forEach(email => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(false);
    });
  });

  it('should accept valid email formats', () => {
    const validEmails = [
      'user@example.com',
      'test.user@domain.org',
      'email+tag@gmail.com',
      'user123@subdomain.domain.co.uk',
    ];

    validEmails.forEach(email => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(true);
    });
  });

  it('should trim and lowercase emails', () => {
    const result = emailSchema.safeParse('  TEST@EXAMPLE.COM  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('should reject emails longer than 255 characters', () => {
    const longEmail = 'a'.repeat(250) + '@test.com';
    const result = emailSchema.safeParse(longEmail);
    expect(result.success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('should validate complete sign up data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'SecurePass1!',
      captcha: 'captcha-token',
    };

    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing captcha', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'SecurePass1!',
      captcha: '',
    };

    const result = signUpSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject weak passwords', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'weak',
      captcha: 'captcha-token',
    };

    const result = signUpSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid emails', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'SecurePass1!',
      captcha: 'captcha-token',
    };

    const result = signUpSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('should validate complete login data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'anypassword',
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should not enforce password complexity for login', () => {
    // Login only requires password to be non-empty
    const validData = {
      email: 'user@example.com',
      password: 'simple',
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('passwordResetSchema', () => {
  it('should validate valid email', () => {
    const validData = { email: 'user@example.com' };
    const result = passwordResetSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = { email: 'invalid' };
    const result = passwordResetSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
