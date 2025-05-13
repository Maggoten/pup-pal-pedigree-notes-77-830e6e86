
import React from 'react';

interface WelcomeHeaderProps {
  username?: string; // Changed from userName to username for consistency
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username }) => {
  const greeting = username ? `Welcome, ${username}!` : "Welcome to your breeding dashboard!";
  
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-primary">{greeting}</h2>
      <p className="text-darkgray-600">
        Your breeding journey at a glance
      </p>
    </div>
  );
};

export default WelcomeHeader;
