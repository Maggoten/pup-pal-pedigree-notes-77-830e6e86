
import React from 'react';
import { Reminder } from '@/types/reminders';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trash, Clock } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';

interface RemindersListProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const RemindersList: React.FC<RemindersListProps> = ({ 
  reminders, 
  onComplete, 
  onDelete,
  compact = false
}) => {
  if (reminders.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        <p>No reminders found.</p>
      </div>
    );
  }

  const getFormattedDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    if (isToday(date)) {
      return 'Today';
    } else if (isPast(date)) {
      return `${formatDistanceToNow(date)} ago`;
    } else {
      return `In ${formatDistanceToNow(date)}`;
    }
  };

  const getPriorityClass = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-2">
      {reminders.map((reminder) => {
        // Ensure priority is a valid value, defaulting to 'medium' if not
        const priority = (['high', 'medium', 'low'].includes(reminder.priority as string)) 
          ? reminder.priority as 'high' | 'medium' | 'low'
          : 'medium';
        
        // Ensure dueDate is a Date object
        const dueDate = reminder.dueDate instanceof Date 
          ? reminder.dueDate 
          : new Date(reminder.dueDate);
          
        // Use a default icon if none is provided
        const reminderIcon = reminder.icon || <Clock className="h-4 w-4" />;

        return (
          <div 
            key={reminder.id} 
            className={`border rounded-md p-3 transition-all ${
              reminder.isCompleted ? 'bg-muted/50' : 'bg-background hover:shadow-sm'
            } ${compact ? 'py-2 px-3' : ''}`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex gap-3 items-start">
                <div className={`mt-1 ${getPriorityClass(priority)}`}>
                  {reminderIcon}
                </div>
                
                <div className={reminder.isCompleted ? 'text-muted-foreground' : ''}>
                  <h4 className={`font-medium ${compact ? 'text-sm' : ''}`}>
                    {reminder.title}
                  </h4>
                  
                  {reminder.description && !compact && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {reminder.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 
                      {getFormattedDate(dueDate)}
                    </span>
                    
                    {!compact && (
                      <span className={`text-xs ${getPriorityClass(priority)}`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant={reminder.isCompleted ? "secondary" : "outline"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onComplete(reminder.id)}
                >
                  <CheckCircle className={`h-4 w-4 ${reminder.isCompleted ? 'text-green-500' : ''}`} />
                  <span className="sr-only">{reminder.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}</span>
                </Button>
                
                {onDelete && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDelete(reminder.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RemindersList;
