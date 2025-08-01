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
        
        // CRITICAL: Show pricing selection and prevent navigation until payment is complete
        setShowPricingSelection(true);
        // Don't allow users to navigate away from this flow
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
    
    console.log('🔥 STARTING PAYMENT SETUP:', { billingInterval });
    
    try {
      // Get current session - simple approach
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔥 SESSION CHECK:', { 
        hasSession: !!session, 
        hasToken: !!session?.access_token,
        hasUser: !!session?.user?.id,
        sessionError 
      });
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required. Please refresh and try again.');
      }
      
      console.log('🔥 CALLING EDGE FUNCTION...');
      
      // Simple direct call to edge function
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-registration-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { billingInterval }
      });
      
      console.log('🔥 EDGE FUNCTION RESPONSE:', { checkoutData, checkoutError });
      
      if (checkoutError) {
        console.error('🔥 CHECKOUT ERROR:', checkoutError);
        throw new Error(checkoutError.message || 'Payment setup failed');
      }
      
      if (!checkoutData?.url) {
        console.error('🔥 NO CHECKOUT URL:', checkoutData);
        throw new Error('No checkout URL received');
      }
      
      console.log('🔥 REDIRECTING TO STRIPE:', checkoutData.url);
      
      // Redirect to Stripe checkout
      window.location.href = checkoutData.url;
      
    } catch (error) {
      console.error('Login page: Payment setup error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let errorMsg = "An unexpected error occurred during payment setup. Please try again.";
      
      if (errorMessage.includes('Authentication required')) {
        errorMsg = "Authentication session not ready. Please try again in a moment.";
      }
      
      toast({
        title: "Session Error",
        description: errorMsg,
        variant: "destructive",
      });
      
      // Keep pricing modal open for retry on any error
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
