
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/dateUtils';

const UserWelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Breeder';
  const today = new Date();
  
  return (
    <div className="flex flex-col space-y-1 mb-2">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        Welcome back, {firstName}
      </h1>
      <p className="text-muted-foreground">
        Today is {formatDate(today, { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
};

export default UserWelcomeBanner;
