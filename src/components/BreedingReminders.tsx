
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import RemindersList from './reminders/RemindersList';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';

const BreedingReminders: React.FC = () => {
  const { reminders, handleMarkComplete } = useBreedingReminders();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Breeding Reminders
        </CardTitle>
        <CardDescription>
          Important tasks and upcoming events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RemindersList reminders={reminders} onComplete={handleMarkComplete} />
      </CardContent>
    </Card>
  );
};

export default BreedingReminders;
