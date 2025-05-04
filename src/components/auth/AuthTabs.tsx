
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm, { LoginFormValues } from './LoginForm';
import RegistrationForm, { RegistrationFormValues } from './RegistrationForm';
import BreedingJourneyLogo from '@/components/BreedingJourneyLogo';

interface AuthTabsProps {
  onLogin: (values: LoginFormValues) => void;
  onRegister: (values: RegistrationFormValues) => void;
  isLoading: boolean;
}

const AuthTabs: React.FC<AuthTabsProps> = ({
  onLogin,
  onRegister,
  isLoading
}) => {
  return (
    <Card className="w-full max-w-md shadow-lg bg-white border-warmbeige-200">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <BreedingJourneyLogo size="lg" showText={false} />
        </div>
        <CardTitle className="text-2xl font-bold text-warmgreen-600 font-playfair my-0 py-0">Breeding Journey</CardTitle>
        <CardDescription className="text-warmgreen-800">
          Where smart breeding begins
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-warmbeige-100">
            <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-warmgreen-700">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-warmgreen-700">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onSubmit={onLogin} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="register">
            <RegistrationForm onSubmit={onRegister} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthTabs;
