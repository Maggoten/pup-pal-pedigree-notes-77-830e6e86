
import React from 'react';

interface WelcomeHeaderProps {
  username: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username }) => {
  return (
    <div className="px-6 pt-4 pb-1 border-b border-greige-200">
      <h2 className="text-2xl font-le-jour text-primary">Welcome back, {username}!</h2>
      <p className="text-sm font-glacial text-muted-foreground">Here's an overview of your breeding program</p>
    </div>
  );
};

export default WelcomeHeader;
