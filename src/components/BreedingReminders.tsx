
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import RemindersList from './reminders/RemindersList';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';

const BreedingReminders: React.FC = () => {
  const { reminders, handleMarkComplete } = useBreedingReminders();
  
  // Take only the top 3 high priority reminders for compact view
  const highPriorityReminders = reminders
    .filter(r => r.priority === 'high')
    .slice(0, 3);
  
  return (
    <Card className="border-primary/20 shadow-sm overflow-hidden transition-shadow hover:shadow-md h-full">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <BellRing className="h-5 w-5" />
          Breeding Reminders
        </CardTitle>
        <CardDescription>
          Important tasks and upcoming events
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <RemindersList reminders={highPriorityReminders.length > 0 ? highPriorityReminders : reminders.slice(0, 3)} onComplete={handleMarkComplete} compact={true} />
      </CardContent>
    </Card>
  );
};

export default BreedingReminders;
