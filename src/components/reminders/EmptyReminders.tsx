
import React from 'react';
import { Bell } from 'lucide-react';

const EmptyReminders: React.FC = () => {
  return (
    <div className="text-center py-6">
      <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
      <h3 className="text-lg font-medium mb-1">No Reminders</h3>
      <p className="text-sm text-muted-foreground">
        You're all caught up! Add more breeding data to generate reminders.
      </p>
    </div>
  );
};

export default EmptyReminders;
