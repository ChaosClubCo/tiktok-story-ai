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

// Simple hash function for storing answers
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

interface AccountRecoveryContextType extends AccountRecoveryState {
  saveBackupEmail: (email: string) => Promise<boolean>;
  sendBackupEmailVerification: (email: string) => Promise<{ success: boolean; token?: string }>;
  verifyBackupEmailCode: (code: string) => Promise<boolean>;
  removeBackupEmail: () => Promise<void>;
  saveSecurityQuestions: (questions: { questionId: string; answer: string }[]) => Promise<boolean>;
  removeSecurityQuestions: () => Promise<void>;
  verifySecurityAnswers: (answers: { questionId: string; answer: string }[]) => Promise<boolean>;
  verifyBackupEmail: (email: string) => boolean;
  clearError: () => void;
  getRecoveryStatus: () => { hasBackupEmail: boolean; hasSecurityQuestions: boolean; isComplete: boolean; isEmailVerified: boolean };
  refreshRecoveryOptions: () => Promise<void>;
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

  // Load recovery options from database
  const loadRecoveryOptions = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('account_recovery_options')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load recovery options:', error);
      }

      // Also check localStorage for pending verification
      const pendingData = localStorage.getItem('minidrama_pending_verification');
      const pending = pendingData ? JSON.parse(pendingData) : null;

      const securityQuestions = (data?.security_questions as { questionId: string; answerHash: string }[]) || [];
      const hasBackupEmail = !!data?.backup_email && data?.backup_email_verified;
      const hasSecurityQuestions = securityQuestions.length >= 2;

      setState({
        isLoading: false,
        recoveryOptions: {
          backupEmail: data?.backup_email || null,
          backupEmailVerified: data?.backup_email_verified || false,
          pendingBackupEmail: pending?.email || null,
          verificationToken: pending?.token || null,
          verificationExpiry: pending?.expiry || null,
          securityQuestions,
          recoverySetupComplete: hasBackupEmail || hasSecurityQuestions,
        },
        error: null,
      });
    } catch (error) {
      console.error('Error loading recovery options:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load recovery options',
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    loadRecoveryOptions();
  }, [loadRecoveryOptions]);

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

      // Store pending verification in localStorage (temporary)
      localStorage.setItem('minidrama_pending_verification', JSON.stringify({
        email,
        token: data.token,
        expiry: data.expiresAt,
      }));

      setState(prev => ({
        ...prev,
        isLoading: false,
        recoveryOptions: {
          ...prev.recoveryOptions,
          pendingBackupEmail: email,
          verificationToken: data.token,
          verificationExpiry: data.expiresAt,
        },
      }));
      
      return { success: true, token: data.token };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to send verification email',
      }));
      return { success: false };
    }
  }, []);

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

      // Save to database via edge function
      const { error } = await supabase.functions.invoke('recovery-options', {
        body: { 
          action: 'save_backup_email',
          backupEmail: pendingBackupEmail,
        },
      });

      if (error) throw error;

      // Clear pending verification
      localStorage.removeItem('minidrama_pending_verification');

      setState(prev => ({
        ...prev,
        isLoading: false,
        recoveryOptions: {
          ...prev.recoveryOptions,
          backupEmail: pendingBackupEmail,
          backupEmailVerified: true,
          pendingBackupEmail: null,
          verificationToken: null,
          verificationExpiry: null,
          recoverySetupComplete: true,
        },
      }));

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to verify code',
      }));
      return false;
    }
  }, [state.recoveryOptions]);

  // Save backup email (legacy - now requires verification)
  const saveBackupEmail = useCallback(async (email: string): Promise<boolean> => {
    const result = await sendBackupEmailVerification(email);
    return result.success;
  }, [sendBackupEmailVerification]);

  // Remove backup email
  const removeBackupEmail = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.functions.invoke('recovery-options', {
        body: { action: 'remove_backup_email' },
      });

      if (error) throw error;

      localStorage.removeItem('minidrama_pending_verification');

      setState(prev => ({
        ...prev,
        isLoading: false,
        recoveryOptions: {
          ...prev.recoveryOptions,
          backupEmail: null,
          backupEmailVerified: false,
          pendingBackupEmail: null,
          verificationToken: null,
          verificationExpiry: null,
          recoverySetupComplete: prev.recoveryOptions.securityQuestions.length >= 2,
        },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to remove backup email',
      }));
    }
  }, []);

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

      const { error } = await supabase.functions.invoke('recovery-options', {
        body: { 
          action: 'save_security_questions',
          securityQuestions: hashedQuestions,
        },
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isLoading: false,
        recoveryOptions: {
          ...prev.recoveryOptions,
          securityQuestions: hashedQuestions,
          recoverySetupComplete: true,
        },
      }));

      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to save security questions',
      }));
      return false;
    }
  }, []);

  // Remove security questions
  const removeSecurityQuestions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.functions.invoke('recovery-options', {
        body: { action: 'remove_security_questions' },
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        isLoading: false,
        recoveryOptions: {
          ...prev.recoveryOptions,
          securityQuestions: [],
          recoverySetupComplete: !!(prev.recoveryOptions.backupEmail && prev.recoveryOptions.backupEmailVerified),
        },
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to remove security questions',
      }));
    }
  }, []);

  // Verify security answers (for recovery flow)
  const verifySecurityAnswers = useCallback(async (
    answers: { questionId: string; answer: string }[]
  ): Promise<boolean> => {
    const storedQuestions = state.recoveryOptions.securityQuestions;
    
    if (storedQuestions.length === 0) return false;
    
    let correctCount = 0;
    for (const answer of answers) {
      const storedQuestion = storedQuestions.find(q => q.questionId === answer.questionId);
      if (storedQuestion && hashAnswer(answer.answer) === storedQuestion.answerHash) {
        correctCount++;
      }
    }
    
    return correctCount >= 2;
  }, [state.recoveryOptions.securityQuestions]);

  // Verify backup email
  const verifyBackupEmail = useCallback((email: string): boolean => {
    return state.recoveryOptions.backupEmail?.toLowerCase() === email.toLowerCase() && 
           state.recoveryOptions.backupEmailVerified;
  }, [state.recoveryOptions.backupEmail, state.recoveryOptions.backupEmailVerified]);

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

  // Refresh recovery options from database
  const refreshRecoveryOptions = useCallback(async () => {
    await loadRecoveryOptions();
  }, [loadRecoveryOptions]);

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
        refreshRecoveryOptions,
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
