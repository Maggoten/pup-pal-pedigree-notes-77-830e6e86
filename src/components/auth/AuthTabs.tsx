
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm, { LoginFormValues } from './LoginForm';
import RegistrationForm, { RegistrationFormValues } from './RegistrationForm';
import BreedingJourneyLogo from '@/components/BreedingJourneyLogo';

interface AuthTabsProps {
  onLogin: (values: LoginFormValues) => void;
  onRegister: (values: RegistrationFormValues) => void;
  isLoading: boolean;
  selectedPlan: 'monthly' | 'yearly';
  onPlanChange: (plan: 'monthly' | 'yearly') => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({
  onLogin,
  onRegister,
  isLoading,
  selectedPlan,
  onPlanChange
}) => {
  const { t } = useTranslation('auth');

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
            <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-warmgreen-700">{t('login')}</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:text-warmgreen-700">{t('register')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onSubmit={onLogin} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            {/* Plan Selection */}
            <div className="bg-warmbeige-50 rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-3 text-brown-800">Choose Your Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onPlanChange('monthly')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPlan === 'monthly' 
                      ? 'border-warmgreen-400 bg-warmgreen-50' 
                      : 'border-warmbeige-200 hover:border-warmgreen-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-brown-800">Monthly</div>
                    <div className="text-sm text-brown-600">$9.99/month</div>
                    <div className="text-xs text-warmgreen-600 mt-1">30-day free trial</div>
                  </div>
                </button>
                <button
                  onClick={() => onPlanChange('yearly')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPlan === 'yearly' 
                      ? 'border-warmgreen-400 bg-warmgreen-50' 
                      : 'border-warmbeige-200 hover:border-warmgreen-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-brown-800">Yearly</div>
                    <div className="text-sm text-brown-600">$99.99/year</div>
                    <div className="text-xs text-warmgreen-600 mt-1">Save 17% + 30-day trial</div>
                  </div>
                </button>
              </div>
            </div>
            
            <RegistrationForm onSubmit={onRegister} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthTabs;
