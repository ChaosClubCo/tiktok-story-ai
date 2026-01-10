import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Mail, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Trash2,
  Plus,
  KeyRound
} from 'lucide-react';
import { useAccountRecovery, SECURITY_QUESTIONS } from '@/hooks/useAccountRecovery';
import { useToast } from '@/hooks/use-toast';

export function AccountRecovery() {
  const { toast } = useToast();
  const {
    isLoading,
    recoveryOptions,
    error,
    saveBackupEmail,
    removeBackupEmail,
    saveSecurityQuestions,
    removeSecurityQuestions,
    clearError,
    getRecoveryStatus,
  } = useAccountRecovery();

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [showRemoveEmailDialog, setShowRemoveEmailDialog] = useState(false);
  const [showRemoveQuestionsDialog, setShowRemoveQuestionsDialog] = useState(false);
  
  const [backupEmail, setBackupEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedQuestions, setSelectedQuestions] = useState<{ questionId: string; answer: string }[]>([
    { questionId: '', answer: '' },
    { questionId: '', answer: '' },
  ]);

  const { hasBackupEmail, hasSecurityQuestions, isComplete } = getRecoveryStatus();

  const handleSaveBackupEmail = async () => {
    setIsSubmitting(true);
    clearError();
    
    const success = await saveBackupEmail(backupEmail);
    
    if (success) {
      toast({
        title: 'Backup Email Saved',
        description: 'Your backup email has been saved for account recovery.',
      });
      setShowEmailDialog(false);
      setBackupEmail('');
    }
    
    setIsSubmitting(false);
  };

  const handleRemoveBackupEmail = () => {
    removeBackupEmail();
    setShowRemoveEmailDialog(false);
    toast({
      title: 'Backup Email Removed',
      description: 'Your backup email has been removed.',
    });
  };

  const handleSaveSecurityQuestions = async () => {
    const validQuestions = selectedQuestions.filter(q => q.questionId && q.answer.trim());
    
    if (validQuestions.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please answer at least 2 security questions.',
      });
      return;
    }

    // Check for duplicate questions
    const questionIds = validQuestions.map(q => q.questionId);
    if (new Set(questionIds).size !== questionIds.length) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select different questions for each answer.',
      });
      return;
    }

    setIsSubmitting(true);
    clearError();
    
    const success = await saveSecurityQuestions(validQuestions);
    
    if (success) {
      toast({
        title: 'Security Questions Saved',
        description: 'Your security questions have been saved for account recovery.',
      });
      setShowQuestionsDialog(false);
      setSelectedQuestions([
        { questionId: '', answer: '' },
        { questionId: '', answer: '' },
      ]);
    }
    
    setIsSubmitting(false);
  };

  const handleRemoveSecurityQuestions = () => {
    removeSecurityQuestions();
    setShowRemoveQuestionsDialog(false);
    toast({
      title: 'Security Questions Removed',
      description: 'Your security questions have been removed.',
    });
  };

  const addQuestion = () => {
    if (selectedQuestions.length < 4) {
      setSelectedQuestions([...selectedQuestions, { questionId: '', answer: '' }]);
    }
  };

  const removeQuestion = (index: number) => {
    if (selectedQuestions.length > 2) {
      setSelectedQuestions(selectedQuestions.filter((_, i) => i !== index));
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Account Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Account Recovery
          </CardTitle>
          <CardDescription>
            Set up recovery options to regain access if you lose your biometric device or password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Recovery Status */}
          <div className={`rounded-lg border p-4 ${isComplete ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            <div className="flex items-start gap-3">
              {isComplete ? (
                <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  {isComplete ? 'Recovery options configured' : 'Set up recovery options'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isComplete 
                    ? 'You can recover your account using your backup email or security questions.'
                    : 'Add a backup email or security questions to recover your account if needed.'}
                </p>
              </div>
            </div>
          </div>

          {/* Backup Email Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Backup Email</span>
                {hasBackupEmail && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                )}
              </div>
            </div>
            
            {hasBackupEmail ? (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{recoveryOptions.backupEmail}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setBackupEmail(recoveryOptions.backupEmail || '');
                        setShowEmailDialog(true);
                      }}
                    >
                      Change
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setShowRemoveEmailDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowEmailDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Backup Email
              </Button>
            )}
          </div>

          {/* Security Questions Section */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Security Questions</span>
                {hasSecurityQuestions && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {recoveryOptions.securityQuestions.length} configured
                  </Badge>
                )}
              </div>
            </div>
            
            {hasSecurityQuestions ? (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm">
                      {recoveryOptions.securityQuestions.length} security questions set
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You'll need to answer at least 2 correctly to recover your account
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowQuestionsDialog(true)}
                    >
                      Update
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setShowRemoveQuestionsDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowQuestionsDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Set Up Security Questions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {hasBackupEmail ? 'Update Backup Email' : 'Add Backup Email'}
            </DialogTitle>
            <DialogDescription>
              Enter an alternative email address that can be used to recover your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backup-email">Backup Email Address</Label>
              <Input
                id="backup-email"
                type="email"
                placeholder="backup@example.com"
                value={backupEmail}
                onChange={(e) => setBackupEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use a different email than your primary account email
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveBackupEmail}
              disabled={!backupEmail || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Questions Dialog */}
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {hasSecurityQuestions ? 'Update Security Questions' : 'Set Up Security Questions'}
            </DialogTitle>
            <DialogDescription>
              Choose at least 2 security questions and provide answers. These will be used to verify your identity during account recovery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {selectedQuestions.map((q, index) => (
              <div key={index} className="space-y-3 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Question {index + 1}</Label>
                  {selectedQuestions.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Select 
                  value={q.questionId}
                  onValueChange={(value) => updateQuestion(index, 'questionId', value)}
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
                />
              </div>
            ))}
            
            {selectedQuestions.length < 4 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={addQuestion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Question
              </Button>
            )}
            
            <p className="text-xs text-muted-foreground">
              Tip: Choose questions with answers only you would know. Answers are case-insensitive.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSecurityQuestions}
              disabled={selectedQuestions.filter(q => q.questionId && q.answer.trim()).length < 2 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Questions'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Email Confirmation */}
      <Dialog open={showRemoveEmailDialog} onOpenChange={setShowRemoveEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Backup Email?</DialogTitle>
            <DialogDescription>
              This will remove your backup email. You won't be able to use it for account recovery.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveEmailDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveBackupEmail}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Questions Confirmation */}
      <Dialog open={showRemoveQuestionsDialog} onOpenChange={setShowRemoveQuestionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Security Questions?</DialogTitle>
            <DialogDescription>
              This will remove all your security questions. You won't be able to use them for account recovery.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveQuestionsDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveSecurityQuestions}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
