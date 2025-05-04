
import React from 'react';
import { PawPrint } from 'lucide-react';

export const BackgroundPawPrint: React.FC = () => (
  <div className="absolute top-1 right-1 opacity-5 pointer-events-none">
    <PawPrint className="h-40 w-40 text-primary transform rotate-12" />
  </div>
);

export const NotificationIndicator: React.FC = () => (
  <div className="absolute top-6 right-6 pointer-events-none">
    <div className="relative">
      <div className="absolute animate-ping w-3 h-3 rounded-full bg-primary/30"></div>
      <div className="w-3 h-3 rounded-full bg-primary/60"></div>
    </div>
  </div>
);

export const PawIndicator: React.FC = () => (
  <div className="absolute bottom-2 right-2 opacity-30 pointer-events-none">
    <div className="flex gap-1">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          style={{ opacity: 0.5 + (i * 0.25) }}
        ></div>
      ))}
    </div>
  </div>
);
