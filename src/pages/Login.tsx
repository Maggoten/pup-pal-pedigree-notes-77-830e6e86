
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AuthTabs from '@/components/auth/AuthTabs';
import PaymentForm from '@/components/auth/PaymentForm';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { RegistrationFormValues } from '@/components/auth/RegistrationForm';
import { RegisterData } from '@/types/auth';
import { isMobileSafari } from '@/integrations/supabase/client';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading: authLoading, supabaseUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationFormValues | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Effect to check for existing session on page load
  useEffect(() => {
    if (supabaseUser) {
      console.log('User already logged in, redirecting to home');
      navigate('/');
    }
  }, [supabaseUser, navigate]);

  // Add special mobile device detection
  useEffect(() => {
    if (isMobileSafari()) {
      console.log('Detected Mobile Safari browser');
      
      // Set up viewport for better mobile experience
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Check for cookies enabled
      const cookiesEnabled = navigator.cookieEnabled;
      if (!cookiesEnabled) {
        toast({
          title: "Cookies Required",
          description: "Please enable cookies in your Safari settings to use this app",
          variant: "destructive",
        });
      }
    }
  }, []);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginAttempts(prev => prev + 1);
    
    try {
      console.log('Login page: Attempting login for:', values.email, 
                 'on', isMobileSafari() ? 'Mobile Safari' : 'standard browser',
                 'attempt #', loginAttempts + 1);
      
      const success = await login(values.email, values.password);
      
      if (success) {
        console.log('Login page: Login successful, redirecting');
        
        // Mobile Safari might need a small delay before navigation
        if (isMobileSafari()) {
          setTimeout(() => {
            navigate('/');
          }, 300);
        } else {
          navigate('/');
        }
      } else {
        console.log('Login page: Login failed');
        
        // Mobile-specific guidance
        if (isMobileSafari() && loginAttempts > 0) {
          toast({
            title: "Login Issues on Safari",
            description: "If you're having trouble logging in on Safari, please ensure cookies are enabled in Settings",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Login page: Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = (values: RegistrationFormValues) => {
    setRegistrationData(values);
    // Only show payment screen for premium subscriptions
    if (values.subscriptionType === 'premium') {
      setShowPayment(true);
    } else {
      // Proceed directly with free registration
      handleFreeRegistration(values);
    }
  };

  const handleFreeRegistration = async (values: RegistrationFormValues) => {
    setIsLoading(true);
    
    try {
      const registerData: RegisterData = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName
      };
      
      console.log('Login page: Attempting free registration');
      const success = await register(registerData);
      
      if (success) {
        console.log('Login page: Registration successful');
        
        // Navigate but only if email confirmation is not required
        if (document.cookie.includes('supabase-auth-token') || 
            // Check localStorage as fallback for mobile
            (localStorage.getItem('supabase.auth.token') !== null)) {
          
          // Delay navigation slightly for Mobile Safari
          if (isMobileSafari()) {
            setTimeout(() => {
              navigate('/');
            }, 300);
          } else {
            navigate('/');
          }
        }
      } else {
        console.log('Login page: Registration failed');
      }
    } catch (error) {
      console.error("Login page: Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    
    if (registrationData) {
      try {
        const registerData: RegisterData = {
          email: registrationData.email,
          password: registrationData.password,
          firstName: registrationData.firstName,
          lastName: registrationData.lastName
        };
        
        console.log('Login page: Attempting premium registration');
        const success = await register(registerData);
        
        if (success) {
          console.log('Login page: Registration successful');
          
          // Navigate but only if email confirmation is not required
          if (document.cookie.includes('supabase-auth-token') ||
              // Check localStorage as fallback for mobile
              (localStorage.getItem('supabase.auth.token') !== null)) {
            
            // Delay navigation slightly for Mobile Safari
            if (isMobileSafari()) {
              setTimeout(() => {
                navigate('/');
              }, 300);
            } else {
              navigate('/');
            }
          } else {
            // Stay on login page so user can log in after confirming email
            setShowPayment(false);
          }
        } else {
          console.log('Login page: Registration failed');
          setShowPayment(false);
        }
      } catch (error) {
        console.error("Login page: Registration error:", error);
        setShowPayment(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const effectiveLoading = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {!showPayment ? (
        <AuthTabs 
          onLogin={handleLogin}
          onRegister={handleRegistration}
          isLoading={effectiveLoading}
        />
      ) : (
        <PaymentForm
          onSubmit={handlePayment}
          onBack={() => setShowPayment(false)}
          isLoading={effectiveLoading}
        />
      )}
      
      {/* Mobile browser guidance */}
      {isMobileSafari() && (
        <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-xs p-2 bg-amber-50 border border-amber-200 rounded text-xs text-center text-amber-800">
          Using Safari on iOS: Make sure cookies are enabled in your Safari settings
        </div>
      )}
    </div>
  );
};

export default Login;
