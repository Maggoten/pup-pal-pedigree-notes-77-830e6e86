
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const UserWelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.userMetadata?.firstName || user?.first_name || '';

  return (
    <Card className="bg-gradient-to-r from-warmbeige-100 to-warmbeige-50">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold">
          {firstName ? `Welcome back, ${firstName}!` : 'Welcome to your Dashboard!'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your kennel today
        </p>
      </CardContent>
    </Card>
  );
};

export default UserWelcomeBanner;
