
import React, { useState, useEffect } from 'react';
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
  const { login, register, isLoading: authLoading, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationFormValues | null>(null);
  
  // Redirect to home if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      console.log('Login page: User already logged in, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async (values: LoginFormValues) => {
    console.log('Login attempt with:', values.email);
    setIsLoading(true);
    
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        console.log('Login successful, redirecting to home');
        toast({
          title: "Login successful",
          description: "Welcome back to your breeding journal!"
        });
        navigate('/');
      } else {
        console.log('Login failed in handleLogin');
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Please check your credentials and try again."
        });
      }
    } catch (error) {
      console.error("Login error:", error);
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
    console.log('Registration form submitted, showing payment');
    setRegistrationData(values);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    console.log('Payment submitted, registering user');
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
        
        const success = await register(registerData);
        
        if (success) {
          toast({
            title: "Registration successful",
            description: "Your account has been created."
          });
          setShowPayment(false);
          // Don't navigate here - AuthGuard will handle redirection
        } else {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Please try again with different credentials."
          });
          setShowPayment(false);
        }
      } catch (error) {
        console.error("Registration error:", error);
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
