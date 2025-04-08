
import React from 'react';

const WelcomeHeader: React.FC = () => {
  return (
    <div className="w-full bg-primary/10 py-3 border-b border-primary/20">
      <div className="container flex items-center justify-center md:justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/68a7e285-b737-404f-a919-e392c8953be4.png" 
            alt="Breeding Journey Logo" 
            className="h-10 w-10 object-contain"
          />
          <h1 className="font-le-jour-serif text-xl md:text-2xl text-primary">
            Breeding Journey - A breeders best friend
          </h1>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
