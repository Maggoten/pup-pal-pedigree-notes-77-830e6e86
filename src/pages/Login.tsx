
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
  
  // Add state to track if payment is required (default to false)
  const [requirePayment, setRequirePayment] = useState(false);

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

  const handleRegistration = async (values: RegistrationFormValues) => {
    // Check if payment is required
    if (requirePayment) {
      // Store registration data and show payment form
      setRegistrationData(values);
      setShowPayment(true);
    } else {
      // Register directly without payment
      await handleDirectRegistration(values);
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
    if (registrationData) {
      await handleDirectRegistration(registrationData);
    }
  };

  // Toggle for enabling/disabling payment requirement (for testing/development)
  const togglePaymentRequirement = () => {
    setRequirePayment(!requirePayment);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-greige-50 p-4">
      <div className="text-center mb-8">
        {/* Removed the Breeding Journey text */}
      </div>
      {!showPayment ? (
        <div className="flex flex-col gap-4">
          <AuthTabs 
            onLogin={handleLogin}
            onRegister={handleRegistration}
            isLoading={isLoading}
          />
          
          {/* Development toggle for payment requirement */}
          <div className="mt-4 text-xs text-center">
            <button 
              onClick={togglePaymentRequirement}
              className="text-greige-500 hover:text-greige-700 underline"
            >
              {requirePayment ? "Disable" : "Enable"} Payment Step (Development Only)
            </button>
          </div>
        </div>
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
