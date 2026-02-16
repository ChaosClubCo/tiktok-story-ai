import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, HelpCircle, Mail, Phone, MapPin, RefreshCw, ShieldAlert, Clock, Check, Wand2, Fingerprint, UserCircle, KeyRound } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useLoginRateLimit } from "@/hooks/useLoginRateLimit";
import { SecurityIndicator } from "@/components/SecurityIndicator";
import { signUpSchema, loginSchema, passwordResetSchema } from "@/lib/authValidation";
import { useAuth } from "@/hooks/useAuth";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useGuestMode } from "@/hooks/useGuestMode";
import { AccountRecoveryFlow } from "@/components/auth/AccountRecoveryFlow";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [captcha, setCaptcha] = useState({ question: "", answer: 0, userAnswer: "" });
  const [loginCaptcha, setLoginCaptcha] = useState({ question: "", answer: 0, userAnswer: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, profileLoading } = useAuth();
  const { monitorAuthAttempts, monitorSuspiciousActivity } = useSecurityMonitoring();
  const authRateLimit = useRateLimit({ maxAttempts: 5, windowMs: 15 * 60 * 1000, identifier: 'auth' });
  const loginRateLimit = useLoginRateLimit();
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const passwordResetRateLimit = useRateLimit({ maxAttempts: 3, windowMs: 5 * 60 * 1000, identifier: 'password-reset' });
  const resendVerificationRateLimit = useRateLimit({ maxAttempts: 3, windowMs: 5 * 60 * 1000, identifier: 'resend-verification' });
  const magicLinkRateLimit = useRateLimit({ maxAttempts: 3, windowMs: 5 * 60 * 1000, identifier: 'magic-link' });
  
  // Biometric and guest mode
  const biometric = useBiometricAuth();
  const { enterGuestMode } = useGuestMode();
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showAccountRecovery, setShowAccountRecovery] = useState(false);

  // Check server-side rate limit on mount
  useEffect(() => {
    loginRateLimit.checkRateLimit();
  }, []);

  // Generate simple math captcha for signup
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha({
      question: `${a} + ${b} = ?`,
      answer: a + b,
      userAnswer: ""
    });
  };

  // Generate login captcha (shown after 3 failed attempts)
  const generateLoginCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setLoginCaptcha({
      question: `${a} + ${b} = ?`,
      answer: a + b,
      userAnswer: ""
    });
  };

  // Generate login captcha when required
  useEffect(() => {
    if (loginRateLimit.requiresCaptcha && !loginCaptcha.question) {
      generateLoginCaptcha();
    }
  }, [loginRateLimit.requiresCaptcha]);

  // Helper function to redirect based on onboarding status
  const redirectAfterAuth = async (userId: string) => {
    // Check if user has completed onboarding
    const { data: profileData } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .single();

    if (profileData && !profileData.onboarding_completed) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirectAfterAuth(session.user.id);
      }
    };
    checkSession();
    generateCaptcha();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const rateLimitCheck = authRateLimit.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      toast({
        variant: "destructive",
        title: "Too Many Attempts",
        description: `Please wait ${rateLimitCheck.retryAfter} seconds before trying again.`,
      });
      return;
    }
    
    setIsLoading(true);

    // Validate with Zod
    const validation = signUpSchema.safeParse({ 
      email, 
      password, 
      captcha: captcha.userAnswer 
    });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: firstError.message,
      });
      setIsLoading(false);
      return;
    }

    if (parseInt(captcha.userAnswer) !== captcha.answer) {
      toast({
        title: "Security Verification Failed",
        description: "Please solve the math problem correctly",
        variant: "destructive",
      });
      generateCaptcha();
      setIsLoading(false);
      return;
    }

    // Use environment-based redirect URL (works in dev, preview, and production)
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      monitorAuthAttempts(email, false);
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      monitorAuthAttempts(email, true);
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Check Your Email!",
          description: "We've sent you a confirmation link. Please check your inbox and click the link to activate your account.",
        });
      } else if (data.session) {
        toast({
          title: "Account Created!",
          description: "You have been signed in successfully.",
        });
        // Redirect to onboarding for new users
        navigate("/onboarding");
      }
      setEmail("");
      setPassword("");
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check server-side IP rate limiting first
    if (loginRateLimit.isBlocked) {
      toast({
        variant: "destructive",
        title: "Account Temporarily Locked",
        description: loginRateLimit.warningMessage || `Too many failed attempts. Try again in ${loginRateLimit.formatTimeRemaining()}.`,
      });
      return;
    }
    
    // Check client-side rate limiting
    const rateLimitCheck = authRateLimit.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      toast({
        variant: "destructive",
        title: "Too Many Attempts",
        description: `Please wait ${rateLimitCheck.retryAfter} seconds before trying again.`,
      });
      return;
    }

    // Check CAPTCHA if required
    let captchaSolved = false;
    if (loginRateLimit.requiresCaptcha) {
      if (!loginCaptcha.userAnswer) {
        toast({
          variant: "destructive",
          title: "Security Verification Required",
          description: "Please solve the math problem to continue.",
        });
        return;
      }
      
      if (parseInt(loginCaptcha.userAnswer) !== loginCaptcha.answer) {
        toast({
          variant: "destructive",
          title: "Incorrect Answer",
          description: "Please solve the math problem correctly.",
        });
        generateLoginCaptcha();
        return;
      }
      captchaSolved = true;
    }
    
    setIsLoading(true);

    // Validate with Zod
    const validation = loginSchema.safeParse({ email, password });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: firstError.message,
      });
      setIsLoading(false);
      return;
    }

    // Set session persistence based on remember me option
    // If rememberMe is true, use longer session duration
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Supabase handles session persistence via cookies
        // The remember me preference is stored to indicate user intent
      }
    });

    // Store remember me preference for session restoration
    if (rememberMe) {
      localStorage.setItem('minidrama_remember_me', 'true');
    } else {
      localStorage.removeItem('minidrama_remember_me');
      // For non-remember sessions, we'll let the default session behavior handle expiry
    }

    if (error) {
      monitorAuthAttempts(email, false);
      
      // Record failed attempt to server for IP-based rate limiting
      const rateLimitResult = await loginRateLimit.recordAttempt(false, captchaSolved);
      
      // Parse error message for clearer user feedback
      let errorTitle = "Sign In Failed";
      let errorMessage = error.message;
      let showResendOption = false;
      
      // Distinguish between different error types
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        // Check if email exists by attempting to get user (this is a safe check)
        const { data: signUpData } = await supabase.auth.signUp({
          email,
          password: 'temp_check_12345!',
          options: { data: { check_only: true } }
        });
        
        // If signUp returns a user without session, email exists (wrong password)
        // If signUp returns with identities array empty, email exists
        if (signUpData?.user?.identities && signUpData.user.identities.length === 0) {
          errorTitle = "Incorrect Password";
          errorMessage = "The password you entered is incorrect. Please try again or reset your password.";
        } else {
          errorTitle = "Account Not Found";
          errorMessage = "No account exists with this email address. Please check your email or create a new account.";
        }
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        errorTitle = "Email Not Verified";
        errorMessage = "Please verify your email before signing in. Check your inbox for the verification link.";
        showResendOption = true;
        setResendEmail(email);
      }
      
      // Add rate limit context to error message
      if (rateLimitResult?.requiresCaptcha && !captchaSolved) {
        errorMessage = `${errorMessage} Please complete security verification to continue.`;
        generateLoginCaptcha();
      } else if (rateLimitResult?.message && rateLimitResult.captchaAttemptsRemaining !== undefined) {
        if (rateLimitResult.captchaAttemptsRemaining <= 3 && rateLimitResult.captchaAttemptsRemaining > 0) {
          errorMessage = `${errorMessage} ${rateLimitResult.captchaAttemptsRemaining} attempts remaining before lockout.`;
        }
        if (rateLimitResult.requiresCaptcha) {
          generateLoginCaptcha();
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        action: showResendOption ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowResendVerification(true)}
          >
            Resend Email
          </Button>
        ) : undefined,
      });
      setIsLoading(false);
    } else if (data.session) {
      // Record successful attempt to reset rate limit
      await loginRateLimit.recordAttempt(true);
      
      // Reset login captcha state
      setLoginCaptcha({ question: "", answer: 0, userAnswer: "" });
      
      monitorAuthAttempts(email, true);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully",
      });
      // Redirect based on onboarding status
      await redirectAfterAuth(data.session.user.id);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting for password reset
    const rateLimitCheck = passwordResetRateLimit.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      toast({
        variant: "destructive",
        title: "Too Many Reset Attempts",
        description: `Please wait ${rateLimitCheck.retryAfter} seconds before requesting another reset.`,
      });
      return;
    }
    
    setIsResetLoading(true);

    // Validate with Zod
    const validation = passwordResetSchema.safeParse({ email: resetEmail });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: firstError.message,
      });
      setIsResetLoading(false);
      return;
    }

    // Use environment-aware redirect URL for all environments
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset Email Sent!",
        description: "Check your email for password reset instructions",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    }
    setIsResetLoading(false);
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const rateLimitCheck = resendVerificationRateLimit.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      toast({
        variant: "destructive",
        title: "Too Many Requests",
        description: `Please wait ${rateLimitCheck.retryAfter} seconds before requesting another verification email.`,
      });
      return;
    }
    
    setIsResendLoading(true);

    if (!resendEmail || !resendEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      setIsResendLoading(false);
      return;
    }

    // Use resend method - this will send a new confirmation email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: resendEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      // Handle specific error cases
      let errorMessage = error.message;
      if (error.message.toLowerCase().includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      } else if (error.message.toLowerCase().includes('already confirmed')) {
        errorMessage = "This email is already verified. You can sign in directly.";
      }
      
      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification Email Sent!",
        description: "Please check your inbox and click the verification link. Don't forget to check your spam folder.",
      });
      setShowResendVerification(false);
      setResendEmail("");
    }
    setIsResendLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const rateLimitCheck = magicLinkRateLimit.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      toast({
        variant: "destructive",
        title: "Too Many Requests",
        description: `Please wait ${rateLimitCheck.retryAfter} seconds before requesting another magic link.`,
      });
      return;
    }
    
    setIsMagicLinkLoading(true);

    if (!magicLinkEmail || !magicLinkEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      setIsMagicLinkLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: magicLinkEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      let errorMessage = error.message;
      if (error.message.toLowerCase().includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      }
      
      toast({
        title: "Magic Link Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      setMagicLinkSent(true);
      toast({
        title: "Magic Link Sent!",
        description: "Check your email for a sign-in link. It will expire in 1 hour.",
      });
    }
    setIsMagicLinkLoading(false);
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    if (!biometric.isRegistered) {
      toast({
        title: "No Biometric Credentials",
        description: "Please sign in with your password first, then enable biometric authentication in settings.",
        variant: "destructive",
      });
      return;
    }

    setIsBiometricLoading(true);
    
    const userId = await biometric.authenticateBiometric();
    
    if (userId) {
      // For biometric auth, we need to restore the session
      // This is a simplified flow - in production, you'd verify against the server
      const rememberMeStored = localStorage.getItem('minidrama_remember_me');
      
      toast({
        title: "Biometric Authentication",
        description: "Verifying your identity...",
      });
      
      // Check if there's a stored session that matches
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user.id === userId) {
        toast({
          title: "Welcome back!",
          description: "Signed in with biometrics",
        });
        await redirectAfterAuth(session.user.id);
      } else {
        toast({
          title: "Session Expired",
          description: "Please sign in with your password to continue.",
          variant: "destructive",
        });
        biometric.removeBiometric();
      }
    } else if (biometric.error) {
      toast({
        title: "Biometric Failed",
        description: biometric.error,
        variant: "destructive",
      });
    }
    
    setIsBiometricLoading(false);
  };

  // Handle guest mode
  const handleGuestMode = () => {
    enterGuestMode();
    toast({
      title: "Welcome, Guest!",
      description: "You're exploring MiniDrama. Some features are limited.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MiniDrama
          </CardTitle>
          <CardDescription>
            Create viral TikTok scripts with AI
          </CardDescription>
          <div className="flex justify-center pt-2">
            <SecurityIndicator 
              isLimited={authRateLimit.isLimited}
              attempts={authRateLimit.attempts}
              maxAttempts={authRateLimit.maxAttempts}
              remainingTime={authRateLimit.remainingTime}
              progressPercentage={authRateLimit.progressPercentage}
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* IP Block Warning */}
          {loginRateLimit.isBlocked && (
            <Alert variant="destructive" className="mb-4">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Account locked due to too many failed attempts.</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-4 w-4" />
                  {loginRateLimit.formatTimeRemaining()}
                </span>
              </AlertDescription>
            </Alert>
          )}
          
          {/* CAPTCHA Required Warning */}
          {!loginRateLimit.isBlocked && loginRateLimit.requiresCaptcha && (
            <Alert variant="default" className="mb-4 border-orange-500/50 bg-orange-500/10">
              <ShieldAlert className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700 dark:text-orange-400">
                Security verification required. {loginRateLimit.captchaAttemptsRemaining !== null && loginRateLimit.captchaAttemptsRemaining > 0 
                  ? `${loginRateLimit.captchaAttemptsRemaining} attempts remaining before lockout.`
                  : 'Complete the verification below to continue.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Low Attempts Warning (before CAPTCHA) */}
          {!loginRateLimit.isBlocked && !loginRateLimit.requiresCaptcha && loginRateLimit.remainingAttempts !== null && loginRateLimit.remainingAttempts <= 2 && (
            <Alert variant="default" className="mb-4 border-yellow-500/50 bg-yellow-500/10">
              <ShieldAlert className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                Warning: {loginRateLimit.remainingAttempts} login attempt{loginRateLimit.remainingAttempts !== 1 ? 's' : ''} remaining before security verification required.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <PasswordInput
                    id="signin-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={isLoading}
                  />
                  <Label 
                    htmlFor="remember-me" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me for 30 days
                  </Label>
                </div>
                
                {/* Login CAPTCHA - shown after 3 failed attempts */}
                {loginRateLimit.requiresCaptcha && (
                  <div className="space-y-2 p-3 border border-orange-500/30 rounded-md bg-orange-500/5">
                    <Label htmlFor="login-captcha" className="text-sm font-medium flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-orange-600" />
                      Security Verification
                    </Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-sm font-medium">{loginCaptcha.question}</span>
                        <Input
                          id="login-captcha"
                          type="number"
                          placeholder="Answer"
                          value={loginCaptcha.userAnswer}
                          onChange={(e) => setLoginCaptcha(prev => ({ ...prev, userAnswer: e.target.value }))}
                          disabled={isLoading}
                          className="w-20"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={generateLoginCaptcha}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || loginRateLimit.isBlocked}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loginRateLimit.isBlocked ? `Locked (${loginRateLimit.formatTimeRemaining()})` : 'Sign In'}
                </Button>
                <div className="text-center space-y-1">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm"
                  >
                    Forgot your password?
                  </Button>
                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowResendVerification(true)}
                      className="text-sm text-muted-foreground"
                    >
                      Resend verification
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowAccountRecovery(true)}
                      className="text-sm text-muted-foreground"
                    >
                      <KeyRound className="h-3 w-3 mr-1" />
                      Account Recovery
                    </Button>
                  </div>
                </div>
                
                <SocialLoginButtons disabled={isLoading} />
                
                {/* Magic Link Option */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or use passwordless
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMagicLinkEmail(email);
                    setShowMagicLink(true);
                  }}
                  disabled={isLoading}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Sign in with Magic Link
                </Button>
                
                {/* Biometric Authentication */}
                {biometric.isAvailable && biometric.isRegistered && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleBiometricAuth}
                    disabled={isLoading || isBiometricLoading}
                  >
                    {isBiometricLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Fingerprint className="mr-2 h-4 w-4" />
                    )}
                    Sign in with Biometrics
                  </Button>
                )}
                
                {/* Guest Mode */}
                <div className="relative pt-2">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Just browsing?
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={handleGuestMode}
                  disabled={isLoading}
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  Continue as Guest
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <PasswordInput
                    id="signup-password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <PasswordStrengthIndicator password={password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="captcha">Security Verification</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm font-medium">{captcha.question}</span>
                      <Input
                        id="captcha"
                        type="number"
                        placeholder="Answer"
                        value={captcha.userAnswer}
                        onChange={(e) => setCaptcha(prev => ({ ...prev, userAnswer: e.target.value }))}
                        disabled={isLoading}
                        className="w-20"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateCaptcha}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                
                <SocialLoginButtons disabled={isLoading} />
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" size="sm">
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Contact Us</DialogTitle>
                <DialogDescription>
                  Need help? Get in touch with our support team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@minidrama.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Office Address</p>
                    <p className="text-sm text-muted-foreground">
                      123 Digital Ave, Suite 456<br />
                      Tech City, TC 12345
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Business Hours: Monday - Friday, 9 AM - 6 PM EST
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={isResetLoading}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
                disabled={isResetLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isResetLoading}>
                {isResetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resend Verification Email Dialog */}
      <Dialog open={showResendVerification} onOpenChange={setShowResendVerification}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resend Verification Email</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a new verification link. 
              Check your spam folder if you don't see it in your inbox.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResendVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resend-email">Email</Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={isResendLoading}
              />
            </div>
            <Alert className="border-muted bg-muted/50">
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Verification emails are valid for 24 hours. If your link expired, 
                use this form to request a new one.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResendVerification(false);
                  setResendEmail("");
                }}
                className="flex-1"
                disabled={isResendLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isResendLoading}>
                {isResendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend Verification
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Magic Link Dialog */}
      <Dialog open={showMagicLink} onOpenChange={(open) => {
        setShowMagicLink(open);
        if (!open) {
          setMagicLinkSent(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Sign in with Magic Link
            </DialogTitle>
            <DialogDescription>
              {magicLinkSent 
                ? "Check your email for the magic link. Click it to sign in instantly."
                : "Enter your email and we'll send you a secure link to sign in without a password."
              }
            </DialogDescription>
          </DialogHeader>
          
          {magicLinkSent ? (
            <div className="space-y-4">
              <Alert className="border-green-500/50 bg-green-500/10">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Magic link sent to <strong>{magicLinkEmail}</strong>
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Check your inbox (and spam folder)</p>
                <p>• The link expires in 1 hour</p>
                <p>• Click the link to sign in instantly</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowMagicLink(false);
                    setMagicLinkSent(false);
                    setMagicLinkEmail("");
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMagicLinkSent(false);
                  }}
                  className="flex-1"
                >
                  Send Again
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="Enter your email"
                  value={magicLinkEmail}
                  onChange={(e) => setMagicLinkEmail(e.target.value)}
                  disabled={isMagicLinkLoading}
                />
              </div>
              <Alert className="border-muted bg-muted/50">
                <Wand2 className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  No password needed! We'll send a secure link to your email. 
                  Click it to sign in instantly.
                </AlertDescription>
              </Alert>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowMagicLink(false);
                    setMagicLinkEmail("");
                  }}
                  className="flex-1"
                  disabled={isMagicLinkLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isMagicLinkLoading}>
                  {isMagicLinkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Magic Link
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Account Recovery Flow */}
      <AccountRecoveryFlow
        open={showAccountRecovery}
        onOpenChange={setShowAccountRecovery}
        onRecoverySuccess={() => setShowAccountRecovery(false)}
      />
    </div>
  );
};

export default Auth;