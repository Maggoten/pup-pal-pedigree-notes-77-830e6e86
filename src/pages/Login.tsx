
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AuthTabs from '@/components/auth/AuthTabs';
import PaymentForm from '@/components/auth/PaymentForm';
import { LoginFormValues } from '@/components/auth/LoginForm';
import { RegistrationFormValues } from '@/components/auth/RegistrationForm';
import { RegisterData } from '@/types/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationFormValues | null>(null);
  const [developerMode, setDeveloperMode] = useState(false);

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
    
    // If developer mode is enabled, skip payment and register directly
    if (developerMode) {
      handleDirectRegistration(values);
    } else {
      setShowPayment(true);
    }
  };
  
  const handleDirectRegistration = async (values: RegistrationFormValues) => {
    setIsLoading(true);
    
    try {
      const registerData: RegisterData = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address
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
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "An unexpected error occurred. Please try again."
      });
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

  // Toggle developer mode
  const toggleDeveloperMode = () => {
    setDeveloperMode(!developerMode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-greige-50 p-4">
      <div className="text-center mb-8">
        {/* Removed the Breeding Journey text */}
      </div>
      {!showPayment ? (
        <>
          <AuthTabs 
            onLogin={handleLogin}
            onRegister={handleRegistration}
            isLoading={isLoading}
          />
          <div className="mt-4 flex justify-center">
            <button 
              onClick={toggleDeveloperMode}
              className="text-xs text-gray-500 underline hover:text-gray-700"
            >
              {developerMode ? "Disable Developer Mode" : "Enable Developer Mode"}
            </button>
          </div>
          {developerMode && (
            <div className="mt-2 text-xs text-amber-600 max-w-md text-center">
              Developer Mode is active. Registration will bypass the payment step.
            </div>
          )}
        </>
      ) : (
        <PaymentForm
          onSubmit={handlePayment}
          onBack={() => setShowPayment(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Login;
