
import React from 'react';
import { Reminder } from '@/types/reminders';
import ReminderItem from './ReminderItem';
import { format, isPast, isToday } from 'date-fns';
import { CalendarDays, CircleAlert } from 'lucide-react';

interface RemindersListProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;  // Added this property
  className?: string;
}

const RemindersList: React.FC<RemindersListProps> = ({ 
  reminders, 
  onComplete, 
  onDelete,
  showDelete = false,  // Default to false
  className 
}) => {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <CalendarDays className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No reminders found</h3>
        <p className="text-sm text-gray-500">
          You're all caught up! When you add reminders, they'll appear here.
        </p>
      </div>
    );
  }

  const getDateStatus = (dueDate: string | Date) => {
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isPast(date)) return 'Overdue';
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {reminders.map((reminder) => (
        <ReminderItem
          key={reminder.id}
          id={reminder.id}
          title={reminder.title}
          description={reminder.description}
          icon={reminder.icon || <CircleAlert className="h-5 w-5" />}
          priority={reminder.priority as 'high' | 'medium' | 'low'}
          dueDate={new Date(reminder.dueDate)}
          type={reminder.type}
          relatedId={reminder.relatedId}
          onComplete={onComplete}
          onDelete={showDelete ? onDelete : undefined}
        />
      ))}
    </div>
  );
};

export default RemindersList;
