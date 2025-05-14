
import React from 'react';
import { User } from '@/types/auth';
import { Card } from '@/components/ui/card';

interface UserWelcomeBannerProps {
  username: string;
  user: User | null;
}

const UserWelcomeBanner: React.FC<UserWelcomeBannerProps> = ({ username, user }) => {
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 p-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {username}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your breeding activities
          </p>
        </div>
      </div>
    </Card>
  );
};

export default UserWelcomeBanner;
