
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
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
        toast({
          title: "Login successful",
          description: "Welcome back to your breeding journal!"
        });
        navigate('/');
      }
    } catch (error) {
      console.error("Login page: Login error:", error);
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = (values: RegistrationFormValues) => {
    setRegistrationData(values);
    setShowPayment(true);
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
          address: registrationData.address
        };
        
        console.log('Login page: Attempting registration');
        const success = await register(registerData);
        
        if (success) {
          console.log('Login page: Registration successful');
          toast({
            title: "Registration successful",
            description: "Your account has been created. Please check your email for confirmation instructions."
          });
          
          // Navigate but only if email confirmation is not required
          if (document.cookie.includes('supabase-auth-token')) {
            navigate('/');
          } else {
            // Stay on login page so user can log in after confirming email
            setShowPayment(false);
          }
        } else {
          setShowPayment(false);
        }
      } catch (error) {
        console.error("Login page: Registration error:", error);
        toast({
          variant: "destructive",
          title: "Registration error",
          description: "An unexpected error occurred. Please try again."
        });
        setShowPayment(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const effectiveLoading = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-greige-50 p-4">
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
