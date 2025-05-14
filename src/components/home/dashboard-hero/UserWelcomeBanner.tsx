
import React from 'react';
import { User } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';

interface UserWelcomeBannerProps {
  username: string;
  user: User | null;
}

const UserWelcomeBanner: React.FC<UserWelcomeBannerProps> = ({ username, user }) => {
  const greeting = getTimeBasedGreeting();
  
  return (
    <Card className="mb-6 border-warmbeige-200 bg-gradient-to-r from-warmbeige-50 to-warmbeige-100">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-warmbeige-900">
              {greeting}, {username}!
            </h1>
            <p className="text-warmbeige-700 mt-1">
              Welcome to your breeding journey dashboard
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default UserWelcomeBanner;
