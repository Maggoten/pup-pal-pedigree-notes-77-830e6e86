import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import AuthTabs from '@/components/auth/AuthTabs';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { RegistrationFormValues } from '@/components/auth/RegistrationForm';
import { RegisterData } from '@/types/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
            const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-registration-checkout', {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            
            if (checkoutError) {
              console.error('Login page: Stripe checkout creation failed:', checkoutError);
              toast({
                title: "Payment setup required",
                description: "Please complete your payment setup to start your trial.",
                variant: "destructive",
              });
            } else if (checkoutData?.checkout_url) {
              console.log('Login page: Redirecting to Stripe checkout');
              // Redirect to Stripe checkout
              window.location.href = checkoutData.checkout_url;
              return; // Don't continue with local navigation
            }
          }
        } catch (stripeError) {
          console.error('Login page: Stripe checkout creation failed:', stripeError);
          toast({
            title: "Payment setup failed",
            description: "There was an issue setting up payment. Please try again.",
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

  const effectiveLoading = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-warmbeige-50/70 p-4">
      <AuthTabs 
        onLogin={handleLogin}
        onRegister={handleRegistration}
        isLoading={effectiveLoading}
      />
    </div>
  );
};

export default Login;
