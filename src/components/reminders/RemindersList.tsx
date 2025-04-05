
import React from 'react';
import ReminderItem from './ReminderItem';
import EmptyReminders from './EmptyReminders';
import { Reminder } from '@/hooks/useBreedingReminders';

interface RemindersListProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
}

const RemindersList: React.FC<RemindersListProps> = ({ reminders, onComplete }) => {
  if (reminders.length === 0) {
    return <EmptyReminders />;
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <ReminderItem
          key={reminder.id}
          id={reminder.id}
          title={reminder.title}
          description={reminder.description}
          icon={reminder.icon}
          priority={reminder.priority}
          dueDate={reminder.dueDate}
          type={reminder.type}
          relatedId={reminder.relatedId}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
};

export default RemindersList;
