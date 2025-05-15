
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import AuthTabs from '@/components/auth/AuthTabs';
import BreedingJourneyLogo from '@/components/BreedingJourneyLogo';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check for redirect param to know where to go after login
  const redirect = searchParams.get('redirect') || '/';
  
  // Handler for successful login - redirects to the specified page
  const handleLoginSuccess = () => {
    navigate(redirect);
  };
  
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="text-center mb-8">
          <BreedingJourneyLogo className="mx-auto h-16 w-auto" />
          <h1 className="text-2xl font-bold mt-4">
            {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {activeTab === 'login' 
              ? 'Sign in to your account to continue'
              : 'Start your breeding journey today'}
          </p>
        </div>

        <Card className="p-6 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <AuthTabs 
              onLoginSuccess={handleLoginSuccess}
            />
          </Tabs>
        </Card>

        {/* Additional info or links could go here */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          By using this service, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
