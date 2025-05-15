
import React from 'react';

interface WelcomeHeaderProps {
  username: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username }) => {
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
