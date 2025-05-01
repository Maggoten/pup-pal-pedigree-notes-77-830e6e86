
import React from 'react';
import ReminderItem from './ReminderItem';
import EmptyReminders from './EmptyReminders';
import { Reminder } from '@/types/reminders';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RemindersListProps {
  reminders: Reminder[];
  onComplete: (id: string, isCompleted?: boolean) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  showDelete?: boolean;
}

const RemindersList: React.FC<RemindersListProps> = ({ 
  reminders, 
  onComplete, 
  onDelete,
  compact = false,
  showDelete = false
}) => {
  const navigate = useNavigate();
  
  if (reminders.length === 0) {
    return <EmptyReminders />;
  }

  return (
    <div className="space-y-0">
      <div className="divide-y divide-primary/5">
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
            isCompleted={reminder.isCompleted}
            onComplete={onComplete}
            onDelete={showDelete && onDelete ? onDelete : undefined}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

export default RemindersList;
