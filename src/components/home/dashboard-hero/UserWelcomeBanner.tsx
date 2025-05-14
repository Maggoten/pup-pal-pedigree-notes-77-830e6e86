
import React from 'react';
import { User } from '@/types/auth';

interface UserWelcomeBannerProps {
  username: string;
  user: User | null;
}

const UserWelcomeBanner: React.FC<UserWelcomeBannerProps> = ({ username, user }) => {
  return (
    <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-warmbeige-50 border border-warmbeige-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {username}!
        </h1>
        <p className="text-gray-600">
          Here's your breeding management overview
        </p>
      </div>
      {user?.firstName && (
        <div className="hidden md:flex items-center gap-2">
          <span className="w-10 h-10 rounded-full bg-warmbeige-200 text-warmbeige-700 flex items-center justify-center text-lg font-bold">
            {user.firstName.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserWelcomeBanner;
