
import React from 'react';
import ReminderItem from './ReminderItem';
import EmptyReminders from './EmptyReminders';
import { Reminder } from '@/hooks/useBreedingReminders';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RemindersListProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
  compact?: boolean;
}

const RemindersList: React.FC<RemindersListProps> = ({ reminders, onComplete, compact = false }) => {
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
            onComplete={onComplete}
            compact={compact}
          />
        ))}
      </div>
      
      {compact && reminders.length > 0 && (
        <div className="p-3 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate('#reminders')}
          >
            View All Reminders
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RemindersList;
