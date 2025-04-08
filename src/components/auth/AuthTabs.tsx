
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LoginForm, { LoginFormValues } from './LoginForm';
import RegistrationForm, { RegistrationFormValues } from './RegistrationForm';
import BreedingJourneyLogo from '@/components/BreedingJourneyLogo';

interface AuthTabsProps {
  onLogin: (values: LoginFormValues) => void;
  onRegister: (values: RegistrationFormValues) => void;
  isLoading: boolean;
  isMobile?: boolean;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ 
  onLogin, 
  onRegister, 
  isLoading,
  isMobile = false
}) => {
  return (
    <Card className="w-full shadow-md border-greige-200 bg-greige-50/80">
      <CardHeader className="space-y-1 text-center pb-2">
        {isMobile && (
          <div className="flex justify-center mb-2">
            <BreedingJourneyLogo size="sm" showText={false} />
          </div>
        )}
        <CardTitle className="text-2xl font-medium font-glacial text-primary tracking-wide">
          Welcome
        </CardTitle>
        <CardDescription className="text-sm font-glacial">
          Your companion for dog breeding management
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-5 bg-greige-100 p-1 rounded-md">
            <TabsTrigger 
              value="login" 
              className="rounded-sm text-base data-[state=active]:text-primary-foreground data-[state=active]:bg-primary"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="rounded-sm text-base data-[state=active]:text-primary-foreground data-[state=active]:bg-primary"
            >
              Register
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <LoginForm onSubmit={onLogin} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="register" className="mt-0">
            <RegistrationForm onSubmit={onRegister} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthTabs;
