
import React from 'react';
import { Bell } from 'lucide-react';

const EmptyReminders: React.FC = () => {
  return (
    <div className="text-center py-8 px-4">
      <div className="bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
        <Bell className="h-6 w-6 text-primary opacity-70" />
      </div>
      <h3 className="text-lg font-medium mb-1">No Reminders</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        You're all caught up! Add more breeding data to generate reminders.
      </p>
    </div>
  );
};

export default EmptyReminders;
