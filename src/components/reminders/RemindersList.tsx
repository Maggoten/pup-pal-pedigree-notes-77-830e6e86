
import React, { memo } from 'react';
import ReminderItem from './ReminderItem';
import EmptyReminders from './EmptyReminders';
import { Reminder } from '@/types/reminders';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

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
  // Add debug logging for the reminders received
  console.log(`RemindersList received ${reminders?.length || 0} reminders`);
  if (reminders?.length > 0) {
    console.log("RemindersList first few items:", reminders.slice(0, 3).map(r => 
      `${r.title} (${r.type}) - Due: ${r.dueDate?.toISOString()}`
    ));
  }
  
  // Early return if no reminders
  if (!reminders || !Array.isArray(reminders) || reminders.length === 0) {
    console.log("RemindersList: No reminders, showing EmptyReminders component");
    return <EmptyReminders />;
  }

  // Split reminders into active and completed
  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);
  
  console.log(`RemindersList: ${activeReminders.length} active, ${completedReminders.length} completed`);
  
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
