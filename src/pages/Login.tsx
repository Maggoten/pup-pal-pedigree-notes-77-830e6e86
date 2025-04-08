
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AuthTabs from '@/components/auth/AuthTabs';
import PaymentForm from '@/components/auth/PaymentForm';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { RegistrationFormValues } from '@/components/auth/RegistrationForm';
import { RegisterData } from '@/types/auth';
import BreedingJourneyLogo from '@/components/BreedingJourneyLogo';
import { useIsMobile } from '@/hooks/use-mobile';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationFormValues | null>(null);
  const isMobile = useIsMobile();

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back to your breeding journal!"
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Please check your credentials and try again."
        });
      }
    } catch (error) {
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
        
        const success = await register(registerData);
        
        if (success) {
          toast({
            title: "Registration successful",
            description: "Welcome to Breeding Journey! Your account has been created."
          });
          
          navigate('/');
        } else {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: "Please try again."
          });
          setShowPayment(false);
        }
      } catch (error) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md text-center mb-6 md:mb-8 animate-fade-in">
        <BreedingJourneyLogo size="lg" showText={true} />
      </div>
      
      <div className={`w-full max-w-md ${!showPayment ? 'animate-scale-in' : ''}`}>
        {!showPayment ? (
          <AuthTabs 
            onLogin={handleLogin}
            onRegister={handleRegistration}
            isLoading={isLoading}
            isMobile={isMobile}
          />
        ) : (
          <PaymentForm
            onSubmit={handlePayment}
            onBack={() => setShowPayment(false)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
