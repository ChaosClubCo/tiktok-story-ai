import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  KeyRound, 
  Mail, 
  HelpCircle, 
  Loader2, 
  ArrowLeft, 
  CheckCircle2,
  AlertCircle,
  Send
} from 'lucide-react';
import { SECURITY_QUESTIONS } from '@/hooks/useAccountRecovery';
import { supabase } from '@/integrations/supabase/client';

interface AccountRecoveryFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecoverySuccess: () => void;
}

type RecoveryStep = 'method' | 'email-verify' | 'security-questions' | 'success';

export function AccountRecoveryFlow({ open, onOpenChange, onRecoverySuccess }: AccountRecoveryFlowProps) {
  const [step, setStep] = useState<RecoveryStep>('method');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Email recovery state
  const [backupEmail, setBackupEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  // Security questions state
  const [userEmail, setUserEmail] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<{ questionId: string; answer: string }[]>([
    { questionId: '', answer: '' },
    { questionId: '', answer: '' },
  ]);
  
  const handleReset = () => {
    setStep('method');
    setError(null);
    setBackupEmail('');
    setEmailSent(false);
    setUserEmail('');
    setSelectedQuestions([
      { questionId: '', answer: '' },
      { questionId: '', answer: '' },
    ]);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleEmailRecovery = async () => {
    if (!backupEmail || !backupEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request password reset for the backup email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(backupEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (resetError) {
        throw resetError;
      }

      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityQuestionsVerify = async () => {
    const validAnswers = selectedQuestions.filter(q => q.questionId && q.answer.trim());
    
    if (validAnswers.length < 2) {
      setError('Please answer at least 2 security questions');
      return;
    }

    if (!userEmail || !userEmail.includes('@')) {
      setError('Please enter your account email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would verify against stored answers on the server
      // For now, we'll check against localStorage (same as the hook)
      const stored = localStorage.getItem('minidrama_recovery_options');
      
      if (!stored) {
        setError('No recovery options found for this account. Please contact support.');
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);
      const storedQuestions = parsed.options?.securityQuestions || [];

      if (storedQuestions.length === 0) {
        setError('No security questions configured for this account.');
        setIsLoading(false);
        return;
      }

      // Hash and verify answers
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

      let correctCount = 0;
      for (const answer of validAnswers) {
        const storedQuestion = storedQuestions.find((q: any) => q.questionId === answer.questionId);
        if (storedQuestion && hashAnswer(answer.answer) === storedQuestion.answerHash) {
          correctCount++;
        }
      }

      if (correctCount >= 2) {
        // Send password reset email
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(userEmail, {
          redirectTo: `${window.location.origin}/`,
        });

        if (resetError) {
          throw resetError;
        }

        setStep('success');
      } else {
        setError('Security answers do not match. Please try again or contact support.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuestion = (index: number, field: 'questionId' | 'answer', value: string) => {
    const updated = [...selectedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedQuestions(updated);
  };

  const getUsedQuestionIds = () => {
    return selectedQuestions.map(q => q.questionId).filter(Boolean);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Account Recovery
          </DialogTitle>
          <DialogDescription>
            {step === 'method' && 'Choose how you want to recover access to your account.'}
            {step === 'email-verify' && 'Enter your backup email to receive a recovery link.'}
            {step === 'security-questions' && 'Answer your security questions to verify your identity.'}
            {step === 'success' && 'Recovery email has been sent!'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'method' && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              If you've set up recovery options, you can use them to regain access to your account.
            </p>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4"
                onClick={() => setStep('email-verify')}
              >
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Backup Email</p>
                    <p className="text-sm text-muted-foreground">
                      Receive a recovery link to your backup email
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4"
                onClick={() => setStep('security-questions')}
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 mt-0.5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Security Questions</p>
                    <p className="text-sm text-muted-foreground">
                      Answer your security questions to verify identity
                    </p>
                  </div>
                </div>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Don't have recovery options? Contact support for help.
            </p>
          </div>
        )}

        {step === 'email-verify' && !emailSent && (
          <div className="space-y-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep('method');
                setError(null);
              }}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="space-y-2">
              <Label htmlFor="backup-email-recovery">Backup Email Address</Label>
              <Input
                id="backup-email-recovery"
                type="email"
                placeholder="Enter your backup email"
                value={backupEmail}
                onChange={(e) => setBackupEmail(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Enter the backup email you configured for account recovery
              </p>
            </div>

            <Button
              onClick={handleEmailRecovery}
              disabled={isLoading || !backupEmail}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Recovery Link
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'email-verify' && emailSent && (
          <div className="space-y-4 py-4">
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                Recovery link sent to <strong>{backupEmail}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Check your inbox (and spam folder)</p>
              <p>• The link expires in 1 hour</p>
              <p>• Click the link to reset your password</p>
            </div>

            <Button variant="outline" onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}

        {step === 'security-questions' && (
          <div className="space-y-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep('method');
                setError(null);
              }}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="space-y-2">
              <Label htmlFor="account-email">Account Email</Label>
              <Input
                id="account-email"
                type="email"
                placeholder="Enter your account email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {selectedQuestions.map((q, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg border bg-muted/30">
                  <Label className="text-sm">Question {index + 1}</Label>
                  <Select
                    value={q.questionId}
                    onValueChange={(value) => updateQuestion(index, 'questionId', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a question" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECURITY_QUESTIONS.filter(
                        sq => !getUsedQuestionIds().includes(sq.id) || sq.id === q.questionId
                      ).map((sq) => (
                        <SelectItem key={sq.id} value={sq.id}>
                          {sq.question}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Your answer"
                    value={q.answer}
                    onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleSecurityQuestionsVerify}
              disabled={isLoading || selectedQuestions.filter(q => q.questionId && q.answer.trim()).length < 2}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Send Recovery Email'
              )}
            </Button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 py-4">
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                Identity verified! A password reset link has been sent to <strong>{userEmail}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Check your inbox (and spam folder)</p>
              <p>• The link expires in 1 hour</p>
              <p>• Click the link to set a new password</p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
