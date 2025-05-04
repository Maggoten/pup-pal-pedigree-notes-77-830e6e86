
import React from 'react';
import { cn } from '@/lib/utils';
import { format, isToday, isBefore } from 'date-fns';

interface ReminderContentProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  dueDate: Date;
  isCompleted: boolean;
  isOverdue: boolean;
  isDueSoon: boolean;
  compact: boolean;
}

const ReminderContent: React.FC<ReminderContentProps> = ({
  title,
  description,
  icon,
  dueDate,
  isCompleted,
  isOverdue,
  isDueSoon,
  compact
}) => {
  const formattedDate = format(dueDate, compact ? 'MMM d' : 'MMM d, yyyy');
  
  return (
    <div className="flex-grow min-w-0">
      <div className="flex items-center gap-2">
        {/* Icon */}
        <div className="flex-shrink-0 mr-1">
          {icon}
        </div>
        
        {/* Title */}
        <div
          className={cn(
            "flex-grow text-sm font-medium truncate",
            isCompleted ? "text-muted-foreground line-through" : "",
            isOverdue ? "text-rose-700" : ""
          )}
        >
          {title}
        </div>
      </div>
      
      {/* Description - hidden in compact view */}
      {!compact && (
        <div
          className={cn(
            "mt-1 text-xs text-muted-foreground",
            isCompleted ? "line-through" : ""
          )}
        >
          {description}
        </div>
      )}
      
      {/* Due date */}
      <div
        className={cn(
          "text-xs mt-0.5 flex items-center",
          isCompleted ? "text-muted-foreground line-through" : "text-muted-foreground",
          isOverdue ? "text-rose-600 font-medium" : "",
          isDueSoon ? "text-amber-600 font-medium" : ""
        )}
      >
        {isOverdue ? "Overdue: " : isDueSoon ? "Due soon: " : "Due: "}
        {formattedDate}
      </div>
    </div>
  );
};

export default ReminderContent;
