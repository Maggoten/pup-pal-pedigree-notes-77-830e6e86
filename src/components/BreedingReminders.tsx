
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing } from 'lucide-react';
import RemindersList from './reminders/RemindersList';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';

const BreedingReminders: React.FC = () => {
  const { reminders, handleMarkComplete } = useBreedingReminders();
  
  return (
    <Card className="border-primary/20 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center gap-2 text-primary">
          <BellRing className="h-5 w-5" />
          Breeding Reminders
        </CardTitle>
        <CardDescription>
          Important tasks and upcoming events
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <RemindersList reminders={reminders} onComplete={handleMarkComplete} />
      </CardContent>
    </Card>
  );
};

export default BreedingReminders;
