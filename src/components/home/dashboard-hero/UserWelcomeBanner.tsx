
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const UserWelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.firstName || (user?.email ? user.email.split('@')[0] : 'Breeder');
  const today = new Date();
  
  return (
    <div className="flex flex-col space-y-1 mb-2">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        Welcome back, {firstName}
      </h1>
      <p className="text-muted-foreground">
        Today is {format(today, 'MMMM d, yyyy')}
      </p>
    </div>
  );
};

export default UserWelcomeBanner;
