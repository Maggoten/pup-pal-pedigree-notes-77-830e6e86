import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import AuthTabs from '@/components/auth/AuthTabs';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { RegistrationFormValues } from '@/components/auth/RegistrationForm';
import { RegisterData } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PricingSelection, { BillingInterval } from '@/components/auth/PricingSelection';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancellationMessage, setShowCancellationMessage] = useState(false);
  
  // Pricing selection state
  const [showPricingSelection, setShowPricingSelection] = useState(false);
  const [selectedBillingInterval, setSelectedBillingInterval] = useState<BillingInterval>('monthly');
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  // Check for registration cancellation on component mount
  useEffect(() => {
    const cancelled = searchParams.get('registration_cancelled');
    if (cancelled === 'true') {
      setShowCancellationMessage(true);
      // Clear the URL parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('registration_cancelled');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      console.log('Login page: Attempting login for:', values.email);
      const success = await login(values.email, values.password);
      
      if (success) {
        console.log('Login page: Login successful, redirecting');
        navigate('/');
      } else {
        console.log('Login page: Login failed');
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login page: Login error:", error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (values: RegistrationFormValues) => {
    setIsLoading(true);
    
    try {
      const registerData: RegisterData = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      };
      
      console.log('Login page: Attempting registration');
      const success = await register(registerData);
      
      if (success) {
        console.log('Login page: Registration successful, showing pricing selection');
        
        // Show pricing selection instead of immediately creating checkout
        setShowPricingSelection(true);
      } else {
        console.log('Login page: Registration failed');
      }
    } catch (error) {
      console.error("Login page: Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissCancellation = () => {
    setShowCancellationMessage(false);
  };

  const handlePricingSelection = async (billingInterval: BillingInterval) => {
    setSelectedBillingInterval(billingInterval);
    setIsLoading(true);
    
    // Helper function to check session with retry
    const getValidSession = async (maxRetries = 3, delay = 1500) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Login page: Checking session validity (attempt ${attempt}/${maxRetries})`);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error(`Login page: Session error on attempt ${attempt}:`, error);
          if (attempt === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (session?.access_token) {
          console.log(`Login page: Valid session found on attempt ${attempt}`);
          return session;
        }
        
        console.warn(`Login page: No session found on attempt ${attempt}, retrying...`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw new Error('No valid session found after retries');
    };
    
    try {
      console.log('Login page: Starting Stripe checkout with billing interval:', billingInterval);
      
      // Wait for valid session with retry mechanism
      const session = await getValidSession();
      
      console.log('Login page: Making edge function call with session token');
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-registration-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          billingInterval
        }
      });
      
      if (checkoutError) {
        console.error('Login page: Stripe checkout creation failed:', checkoutError);
        
        // Provide specific error messages based on the error type
        let errorTitle = "Payment setup failed";
        let errorDescription = "There was an issue setting up payment. Please try again.";
        
        if (checkoutError.message?.includes('STRIPE_SECRET_KEY')) {
          errorTitle = "Configuration Error";
          errorDescription = "Payment system is not properly configured. Please contact support.";
        } else if (checkoutError.message?.includes('STRIPE_PRICE_ID')) {
          errorTitle = "Configuration Error";
          errorDescription = "Payment pricing is not configured. Please contact support.";
        } else if (checkoutError.message?.includes('Authentication error')) {
          errorTitle = "Authentication Error";
          errorDescription = "Session expired. Please try again.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });
        
        // Go back to pricing selection on error
        setShowPricingSelection(true);
      } else if (checkoutData?.checkout_url) {
        console.log('Login page: Successfully received checkout URL, redirecting to Stripe');
        // Redirect to Stripe checkout
        window.location.href = checkoutData.checkout_url;
        return; // Don't continue with local navigation
      } else {
        console.error('Login page: No checkout URL received from edge function');
        toast({
          title: "Payment setup failed",
          description: "No payment URL was generated. Please try again.",
          variant: "destructive",
        });
        setShowPricingSelection(true);
      }
    } catch (sessionError) {
      console.error('Login page: Session or checkout error:', sessionError);
      
      if (sessionError.message?.includes('No valid session')) {
        toast({
          title: "Session Error",
          description: "Authentication session not ready. Please try again in a moment.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment setup failed",
          description: "An unexpected error occurred during payment setup. Please try again.",
          variant: "destructive",
        });
      }
      
      setShowPricingSelection(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePaymentSetup = async () => {
    setShowCancellationMessage(false);
    setShowPricingSelection(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsForgotPasswordLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Reset failed",
          description: "Unable to send reset email. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset email sent",
          description: "If your email is registered, you'll receive a password reset link shortly.",
        });
        
        // Reset form and hide forgot password section
        setForgotPasswordEmail('');
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const effectiveLoading = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-warmbeige-50/70 p-4 relative">
      {/* Language Switcher in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      {showCancellationMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-lg bg-white border-warmbeige-200">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-bold text-brown-800 font-playfair">
                Registration Incomplete
              </CardTitle>
              <CardDescription className="text-brown-600">
                Your account was created but payment setup was cancelled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-brown-700">
                  To access Breeding Journey and start your 30-day free trial, you'll need to complete the payment setup.
                </p>
                <p className="text-brown-600 text-sm">
                  Don't worry - your trial won't start until the payment method is confirmed, and you won't be charged until after the trial period ends.
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={handleDismissCancellation}
                  variant="outline"
                  className="flex-1 border-warmbeige-300 text-brown-800 hover:bg-warmbeige-100"
                >
                  Maybe Later
                </Button>
                <Button 
                  onClick={handleCompletePaymentSetup}
                  className="flex-1 bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
                  disabled={effectiveLoading}
                >
                  {effectiveLoading ? "Processing..." : "Complete Setup"}
                  {!effectiveLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showPricingSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <PricingSelection 
            onSelectPlan={handlePricingSelection}
            isLoading={effectiveLoading}
          />
        </div>
      )}
      
      {!showForgotPassword && !showPricingSelection ? (
        <div className="w-full max-w-md">
          <AuthTabs 
            onLogin={handleLogin}
            onRegister={handleRegistration}
            isLoading={effectiveLoading}
          />
          
          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-warmgreen-600 hover:text-warmgreen-700 underline"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-md shadow-lg bg-white border-warmbeige-200">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warmgreen-100">
              <Mail className="h-6 w-6 text-warmgreen-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-warmgreen-600 font-playfair">
              Reset Password
            </CardTitle>
            <CardDescription className="text-warmgreen-800">
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-warmgreen-800">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="border-warmbeige-200 focus:border-warmgreen-300"
                  disabled={isForgotPasswordLoading}
                />
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="submit"
                  disabled={isForgotPasswordLoading}
                  className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
                >
                  {isForgotPasswordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    <>
                      Send Reset Link
                      <Mail className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                  }}
                  disabled={isForgotPasswordLoading}
                  className="w-full border-warmbeige-300 text-warmgreen-800 hover:bg-warmbeige-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Login;
