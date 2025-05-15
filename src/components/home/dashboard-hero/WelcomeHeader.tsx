
import React from 'react';

interface WelcomeHeaderProps {
  username: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username }) => {
  return (
    <div className="px-6 pt-4 pb-4 bg-white/50 backdrop-blur-sm border-b border-warmbeige-200 rounded-t-lg">
      <h2 className="text-2xl font-playfair text-warmgreen-700">Welcome back, {username}!</h2>
      <p className="text-sm font-sourcesans text-muted-foreground">Here's an overview of your breeding program</p>
    </div>
  );
};

export default WelcomeHeader;
