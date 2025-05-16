
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Updated import
import AuthTabs from '@/components/auth/AuthTabs';
import PaymentForm from '@/components/auth/PaymentForm';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { RegistrationFormValues } from '@/components/auth/RegistrationForm';
import { RegisterData } from '@/types/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationFormValues | null>(null);

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
        lastName: values.lastName,
      };
      
      console.log('Login page: Attempting free registration');
      const success = await register(registerData);
      
      if (success) {
        console.log('Login page: Registration successful');
        
        // Navigate but only if email confirmation is not required
        if (document.cookie.includes('supabase-auth-token')) {
          navigate('/');
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
          lastName: registrationData.lastName,
        };
        
        console.log('Login page: Attempting premium registration');
        const success = await register(registerData);
        
        if (success) {
          console.log('Login page: Registration successful');
          
          // Navigate but only if email confirmation is not required
          if (document.cookie.includes('supabase-auth-token')) {
            navigate('/');
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
    <div className="min-h-screen flex items-center justify-center bg-warmbeige-50/70 p-4">
      <div className="text-center mb-8">
        {/* Removed the Breeding Journey text */}
      </div>
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
    </div>
  );
};

export default Login;
