
import React, { memo } from 'react';
import ReminderItem from './ReminderItem';
import EmptyReminders from './EmptyReminders';
import { Reminder } from '@/types/reminders';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RemindersListProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  showDelete?: boolean;
}

// Use memo to prevent unnecessary re-renders
const RemindersList: React.FC<RemindersListProps> = memo(({ 
  reminders, 
  onComplete, 
  onDelete,
  compact = false,
  showDelete = false
}) => {
  const navigate = useNavigate();
  
  // Early return if no reminders
  if (!reminders || reminders.length === 0) {
    return <EmptyReminders />;
  }

  // Split reminders into active and completed
  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);
  
  // If in compact mode, prioritize showing active reminders
  const displayReminders = compact 
    ? [...activeReminders, ...completedReminders].slice(0, 3) 
    : [...activeReminders, ...completedReminders];

  return (
    <div className="space-y-0 transition-opacity duration-200">
      <div className="divide-y divide-primary/5">
        {displayReminders.map((reminder) => (
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
            isCompleted={reminder.isCompleted}
            onComplete={onComplete}
            onDelete={showDelete && onDelete ? onDelete : undefined}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
});

RemindersList.displayName = 'RemindersList';

export default RemindersList;
