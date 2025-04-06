
import React from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import DogIllustration from '../illustrations/DogIllustration';

const EmptyReminders: React.FC = () => {
  return (
    <div className="text-center py-8 px-4 bg-primary/5 rounded-lg border border-dashed border-primary/30 relative overflow-hidden">
      <div className="absolute -right-6 -top-5 opacity-20">
        <DogIllustration 
          breed="border-collie" 
          size={80} 
          color="#75869B" 
        />
      </div>
      
      <div className="relative mx-auto w-14 h-14 mb-4">
        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Bell className="h-7 w-7 text-primary opacity-80" />
        </div>
        <div className="absolute -top-1 -right-1">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      </div>
      
      <h3 className="text-xl font-medium mb-2">All Caught Up!</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
        You have no pending reminders. Add more breeding data to generate new reminders.
      </p>
      
      {/* Decorative dots */}
      <div className="flex justify-center space-x-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
      </div>
      
      <div className="absolute -left-6 -bottom-5 opacity-20">
        <DogIllustration 
          breed="generic" 
          size={60} 
          color="#75869B"
        />
      </div>
    </div>
  );
};

export default EmptyReminders;
