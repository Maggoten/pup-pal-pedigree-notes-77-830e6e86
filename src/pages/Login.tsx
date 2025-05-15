import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthTabs } from '@/components/auth/AuthTabs';
import { BreedingJourneyLogo } from '@/components/ui/logo';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        
        <div className="mt-8 bg-white px-6 py-8 rounded-lg shadow-md dark:bg-gray-800">
          <div className="mb-6">
            <BreedingJourneyLogo />
          </div>
          
          <AuthTabs />
          
        </div>
      </div>
    </div>
  );
};

export default Login;
