import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SecurityQuestion {
  id: string;
  question: string;
}

interface RecoveryOptions {
  backupEmail: string | null;
  backupEmailVerified: boolean;
  pendingBackupEmail: string | null;
  verificationToken: string | null;
  verificationExpiry: string | null;
  securityQuestions: {
    questionId: string;
    answerHash: string;
  }[];
  recoverySetupComplete: boolean;
}

interface AccountRecoveryState {
  isLoading: boolean;
  recoveryOptions: RecoveryOptions;
  error: string | null;
}

const STORAGE_KEY = 'minidrama_recovery_options';

export const SECURITY_QUESTIONS: SecurityQuestion[] = [
  { id: 'pet', question: "What was the name of your first pet?" },
  { id: 'school', question: "What elementary school did you attend?" },
  { id: 'city', question: "In what city were you born?" },
  { id: 'friend', question: "What is the name of your childhood best friend?" },
  { id: 'car', question: "What was the make of your first car?" },
  { id: 'mother', question: "What is your mother's maiden name?" },
  { id: 'street', question: "What street did you grow up on?" },
  { id: 'book', question: "What is your favorite book?" },
];

// Simple hash function for storing answers (in production, use proper hashing on server)
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

const verifyAnswer = (answer: string, storedHash: string): boolean => {
  return hashAnswer(answer) === storedHash;
};

interface AccountRecoveryContextType extends AccountRecoveryState {
  saveBackupEmail: (email: string) => Promise<boolean>;
  sendBackupEmailVerification: (email: string) => Promise<{ success: boolean; token?: string }>;
  verifyBackupEmailCode: (code: string) => Promise<boolean>;
  removeBackupEmail: () => void;
  saveSecurityQuestions: (questions: { questionId: string; answer: string }[]) => Promise<boolean>;
  removeSecurityQuestions: () => void;
  verifySecurityAnswers: (answers: { questionId: string; answer: string }[]) => boolean;
  verifyBackupEmail: (email: string) => boolean;
  clearError: () => void;
  getRecoveryStatus: () => { hasBackupEmail: boolean; hasSecurityQuestions: boolean; isComplete: boolean; isEmailVerified: boolean };
}

const AccountRecoveryContext = createContext<AccountRecoveryContextType | undefined>(undefined);

export function AccountRecoveryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<AccountRecoveryState>({
    isLoading: true,
    recoveryOptions: {
      backupEmail: null,
      backupEmailVerified: false,
      pendingBackupEmail: null,
      verificationToken: null,
      verificationExpiry: null,
      securityQuestions: [],
      recoverySetupComplete: false,
    },
    error: null,
  });

  // Load recovery options from storage
  useEffect(() => {
    const loadRecoveryOptions = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (user?.id && parsed.userId === user.id) {
            setState({
              isLoading: false,
              recoveryOptions: {
                backupEmail: parsed.options.backupEmail || null,
                backupEmailVerified: parsed.options.backupEmailVerified || false,
                pendingBackupEmail: parsed.options.pendingBackupEmail || null,
                verificationToken: parsed.options.verificationToken || null,
                verificationExpiry: parsed.options.verificationExpiry || null,
                securityQuestions: parsed.options.securityQuestions || [],
                recoverySetupComplete: parsed.options.recoverySetupComplete || false,
              },
              error: null,
            });
            return;
          }
        }
        
        setState({
          isLoading: false,
          recoveryOptions: {
            backupEmail: null,
            backupEmailVerified: false,
            pendingBackupEmail: null,
            verificationToken: null,
            verificationExpiry: null,
            securityQuestions: [],
            recoverySetupComplete: false,
          },
          error: null,
        });
      } catch {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load recovery options',
        }));
      }
    };

    loadRecoveryOptions();
  }, [user?.id]);

  // Save to storage
  const saveToStorage = useCallback((options: RecoveryOptions) => {
    if (!user?.id) return;
    
    const isComplete = !!((options.backupEmail && options.backupEmailVerified) || options.securityQuestions.length >= 2);
    const updatedOptions = { ...options, recoverySetupComplete: isComplete };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: user.id,
      options: updatedOptions,
    }));
    
    setState(prev => ({
      ...prev,
      recoveryOptions: updatedOptions,
    }));
  }, [user?.id]);

  // Send backup email verification code
  const sendBackupEmailVerification = useCallback(async (email: string): Promise<{ success: boolean; token?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be signed in to add a backup email');
      }

      const { data, error } = await supabase.functions.invoke('send-backup-verification', {
        body: { email },
      });

      if (error) throw error;

      // Store pending verification
      const updatedOptions = {
        ...state.recoveryOptions,
        pendingBackupEmail: email,
        verificationToken: data.token,
        verificationExpiry: data.expiresAt,
      };
      
      saveToStorage(updatedOptions);
      setState(prev => ({ ...prev, isLoading: false }));
      
      return { success: true, token: data.token };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send verification email',
      }));
      return { success: false };
    }
  }, [state.recoveryOptions, saveToStorage]);

  // Verify backup email code
  const verifyBackupEmailCode = useCallback(async (code: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { verificationToken, pendingBackupEmail, verificationExpiry } = state.recoveryOptions;
      
      if (!verificationToken || !pendingBackupEmail) {
        throw new Error('No pending verification found');
      }

      // Check expiry
      if (verificationExpiry && new Date(verificationExpiry) < new Date()) {
        throw new Error('Verification code has expired. Please request a new one.');
      }

      // Decode and verify
      const decoded = JSON.parse(atob(verificationToken));
      
      if (decoded.code !== code) {
        throw new Error('Invalid verification code');
      }

      if (decoded.email !== pendingBackupEmail) {
        throw new Error('Email mismatch');
      }

      // Verification successful - save the email
      const updatedOptions = {
        ...state.recoveryOptions,
        backupEmail: pendingBackupEmail,
        backupEmailVerified: true,
        pendingBackupEmail: null,
        verificationToken: null,
        verificationExpiry: null,
      };
      
      saveToStorage(updatedOptions);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to verify code',
      }));
      return false;
    }
  }, [state.recoveryOptions, saveToStorage]);

  // Save backup email (legacy - now requires verification)
  const saveBackupEmail = useCallback(async (email: string): Promise<boolean> => {
    // This now just initiates verification
    const result = await sendBackupEmailVerification(email);
    return result.success;
  }, [sendBackupEmailVerification]);

  // Remove backup email
  const removeBackupEmail = useCallback(() => {
    const updatedOptions = {
      ...state.recoveryOptions,
      backupEmail: null,
      backupEmailVerified: false,
      pendingBackupEmail: null,
      verificationToken: null,
      verificationExpiry: null,
    };
    saveToStorage(updatedOptions);
  }, [state.recoveryOptions, saveToStorage]);

  // Save security questions
  const saveSecurityQuestions = useCallback(async (
    questions: { questionId: string; answer: string }[]
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (questions.length < 2) {
        throw new Error('Please answer at least 2 security questions');
      }

      const hashedQuestions = questions.map(q => ({
        questionId: q.questionId,
        answerHash: hashAnswer(q.answer),
      }));

      const updatedOptions = {
        ...state.recoveryOptions,
        securityQuestions: hashedQuestions,
      };
      
      saveToStorage(updatedOptions);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to save security questions',
      }));
      return false;
    }
  }, [state.recoveryOptions, saveToStorage]);

  // Remove security questions
  const removeSecurityQuestions = useCallback(() => {
    const updatedOptions = {
      ...state.recoveryOptions,
      securityQuestions: [],
    };
    saveToStorage(updatedOptions);
  }, [state.recoveryOptions, saveToStorage]);

  // Verify security answers
  const verifySecurityAnswers = useCallback((
    answers: { questionId: string; answer: string }[]
  ): boolean => {
    const storedQuestions = state.recoveryOptions.securityQuestions;
    
    if (storedQuestions.length === 0) return false;
    
    let correctCount = 0;
    for (const answer of answers) {
      const storedQuestion = storedQuestions.find(q => q.questionId === answer.questionId);
      if (storedQuestion && verifyAnswer(answer.answer, storedQuestion.answerHash)) {
        correctCount++;
      }
    }
    
    // Require at least 2 correct answers
    return correctCount >= 2;
  }, [state.recoveryOptions.securityQuestions]);

  // Verify backup email
  const verifyBackupEmail = useCallback((email: string): boolean => {
    return state.recoveryOptions.backupEmail?.toLowerCase() === email.toLowerCase();
  }, [state.recoveryOptions.backupEmail]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get recovery status
  const getRecoveryStatus = useCallback(() => {
    const hasBackupEmail = !!state.recoveryOptions.backupEmail;
    const isEmailVerified = state.recoveryOptions.backupEmailVerified;
    const hasSecurityQuestions = state.recoveryOptions.securityQuestions.length >= 2;
    const isComplete = (hasBackupEmail && isEmailVerified) || hasSecurityQuestions;
    
    return { hasBackupEmail, hasSecurityQuestions, isComplete, isEmailVerified };
  }, [state.recoveryOptions]);

  return (
    <AccountRecoveryContext.Provider
      value={{
        ...state,
        saveBackupEmail,
        sendBackupEmailVerification,
        verifyBackupEmailCode,
        removeBackupEmail,
        saveSecurityQuestions,
        removeSecurityQuestions,
        verifySecurityAnswers,
        verifyBackupEmail,
        clearError,
        getRecoveryStatus,
      }}
    >
      {children}
    </AccountRecoveryContext.Provider>
  );
}

export function useAccountRecovery() {
  const context = useContext(AccountRecoveryContext);
  if (!context) {
    throw new Error('useAccountRecovery must be used within an AccountRecoveryProvider');
  }
  return context;
}
