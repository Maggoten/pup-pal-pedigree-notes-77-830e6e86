
import React from 'react';

const WelcomeHeader: React.FC = () => {
  return (
    <div className="w-full bg-background py-6 border-b">
      <div className="container flex items-center justify-center gap-4">
        <img 
          src="/lovable-uploads/c1216a3f-35cb-43bb-90db-449c17a1120a.png" 
          alt="Breeding Journey Logo" 
          className="h-32 w-32" // Doubled from h-16 w-16 to h-32 w-32
        />
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold font-le-jour text-primary">
            Breeding Journey
          </h1>
          <p className="text-black font-glacial">
            A breeders best friend
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
