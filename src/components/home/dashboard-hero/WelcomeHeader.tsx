
import React from 'react';
import { User } from '@/types/auth';

interface WelcomeHeaderProps {
  user: User | null;
  activePregnanciesCount: number;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ user, activePregnanciesCount }) => {
  // Create a username display from user info
  const username = user ? (user.firstName || user.email?.split('@')[0] || 'there') : 'there';
  
  return (
    <div className="flex flex-col space-y-1">
      <h2 className="text-2xl font-bold text-warmgreen-700">
        Welcome back, {username}!
      </h2>
      <p className="text-warmgreen-600 text-sm">
        Here's your breeding journey overview
      </p>
    </div>
  );
};

export default WelcomeHeader;
