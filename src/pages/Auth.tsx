import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, HelpCircle, Mail, Phone, MapPin, RefreshCw } from "lucide-react";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { useRateLimit } from "@/hooks/useRateLimit";
import { SecurityIndicator } from "@/components/SecurityIndicator";
import { signUpSchema, loginSchema, passwordResetSchema } from "@/lib/authValidation";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [captcha, setCaptcha] = useState({ question: "", answer: 0, userAnswer: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { monitorAuthAttempts, monitorSuspiciousActivity } = useSecurityMonitoring();
  const authRateLimit = useRateLimit({ maxAttempts: 5, windowMs: 15 * 60 * 1000, identifier: 'auth' });
  const passwordResetRateLimit = useRateLimit({ maxAttempts: 3, windowMs: 5 * 60 * 1000, identifier: 'password-reset' });

  // Generate simple math captcha
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptcha({
      question: `${a} + ${b} = ?`,
      answer: a + b,
      userAnswer: ""
    });
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
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
      } else {
        toast({
          title: "Account Created!",
          description: "You have been signed in successfully.",
        });
        navigate("/");
      }
      setEmail("");
      setPassword("");
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      monitorAuthAttempts(email, false);
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else if (data.session) {
      monitorAuthAttempts(email, true);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully",
      });
      // Wait a moment for the auth state to update
      setTimeout(() => {
        navigate("/");
      }, 100);
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
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm"
                  >
                    Forgot your password?
                  </Button>
                </div>
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
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a strong password (8+ chars, mixed case, numbers, symbols)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
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
    </div>
  );
};

export default Auth;