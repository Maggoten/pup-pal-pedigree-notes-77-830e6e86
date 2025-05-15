
import React from 'react';

export interface WelcomeHeaderProps {
  username: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {username}
      </h1>
      <p className="text-muted-foreground mt-1">
        Here's what's happening with your kennels today.
      </p>
    </div>
  );
};

export default WelcomeHeader;
