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
import { AlertTriangle, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancellationMessage, setShowCancellationMessage] = useState(false);

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
        console.log('Login page: Registration successful, creating Stripe checkout');
        
        // Create Stripe checkout session for payment collection
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('Login page: Creating Stripe checkout session');
            const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-registration-checkout', {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
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
                errorDescription = "Please log out and try registering again.";
              }
              
              toast({
                title: errorTitle,
                description: errorDescription,
                variant: "destructive",
              });
            } else if (checkoutData?.checkout_url) {
              console.log('Login page: Redirecting to Stripe checkout');
              // Redirect to Stripe checkout
              window.location.href = checkoutData.checkout_url;
              return; // Don't continue with local navigation
            } else {
              console.error('Login page: No checkout URL received');
              toast({
                title: "Payment setup failed",
                description: "No payment URL was generated. Please try again.",
                variant: "destructive",
              });
            }
          } else {
            console.error('Login page: No session found for Stripe checkout');
            toast({
              title: "Session Error",
              description: "Please log out and try registering again.",
              variant: "destructive",
            });
          }
        } catch (stripeError) {
          console.error('Login page: Stripe checkout creation failed:', stripeError);
          toast({
            title: "Payment setup failed",
            description: "An unexpected error occurred during payment setup. Please try again.",
            variant: "destructive",
          });
        }
        
        // Fallback: navigate to home if checkout fails
        navigate('/');
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

  const handleCompletePaymentSetup = async () => {
    setShowCancellationMessage(false);
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-registration-checkout', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        
        if (checkoutError) {
          console.error('Continue registration: Stripe checkout creation failed:', checkoutError);
          toast({
            title: "Payment setup failed",
            description: "There was an issue setting up payment. Please try again.",
            variant: "destructive",
          });
        } else if (checkoutData?.checkout_url) {
          console.log('Continue registration: Redirecting to Stripe checkout');
          window.location.href = checkoutData.checkout_url;
          return;
        }
      } else {
        toast({
          title: "Session expired",
          description: "Please log in again to complete your payment setup.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Continue registration: Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const effectiveLoading = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-warmbeige-50/70 p-4">
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
      
      <AuthTabs 
        onLogin={handleLogin}
        onRegister={handleRegistration}
        isLoading={effectiveLoading}
      />
    </div>
  );
};

export default Login;
