
import React from 'react';
import { BellRing } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NotificationIndicator } from './DecorativeElements';

interface RemindersHeaderProps {
  hasReminders: boolean;
}

const RemindersHeader: React.FC<RemindersHeaderProps> = ({ hasReminders }) => (
  <CardHeader className="bg-gradient-to-r from-warmbeige-100 to-transparent border-b border-warmbeige-200 pb-3 relative">
    <NotificationIndicator />
    
    <CardTitle className="flex items-center gap-2 text-primary">
      <BellRing className="h-5 w-5" />
      Breeding Reminders
    </CardTitle>
    <CardDescription>
      {hasReminders 
        ? "Important tasks and upcoming events" 
        : "All tasks completed - great job!"}
    </CardDescription>
  </CardHeader>
);

export default RemindersHeader;
