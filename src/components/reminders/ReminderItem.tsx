
import React from 'react';
import { format } from 'date-fns';
import { Check, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderItemProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: string;
  relatedId?: string;
  isCompleted?: boolean;
  onComplete: (id: string, isCompleted?: boolean) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  id,
  title,
  description,
  icon,
  dueDate,
  priority,
  type,
  relatedId,
  isCompleted = false,
  onComplete,
  onDelete,
  compact = false
}) => {
  const priorityColor = {
    high: 'text-rose-600 bg-rose-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-green-600 bg-green-50'
  };
  
  const handleToggleComplete = () => {
    // Toggle current completion status
    onComplete(id, !isCompleted);
  };
  
  return (
    <div 
      className={cn(
        "p-3 relative bg-white hover:bg-gray-50 group transition-colors",
        isCompleted && "bg-gray-50 opacity-70"
      )}
    >
      <div className="flex items-start gap-2">
        {/* Left - icon with priority color */}
        <div className={cn("mt-1 p-1.5 rounded-full", priorityColor[priority])}>
          {icon}
        </div>
        
        {/* Center - content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 
              className={cn(
                "font-medium truncate",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {title}
            </h4>
            
            {/* Priority badge for mobile - visible only in non-compact mode */}
            {!compact && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                priorityColor[priority]
              )}>
                {priority}
              </span>
            )}
          </div>
          
          {/* Only show description in non-compact mode */}
          {!compact && (
            <p 
              className={cn(
                "text-sm text-muted-foreground line-clamp-1", 
                isCompleted && "line-through"
              )}
            >
              {description}
            </p>
          )}
          
          {/* Date */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {format(dueDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        
        {/* Right side - action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleComplete}
            className={cn(
              "p-1.5 rounded-full hover:bg-primary/10 transition-colors",
              isCompleted && "bg-primary/10"
            )}
            title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            <Check className={cn(
              "h-4 w-4 text-primary/70",
              isCompleted && "text-primary"
            )} />
          </button>
          
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="p-1.5 rounded-full hover:bg-red-100 transition-colors"
              title="Delete reminder"
            >
              <Trash className="h-4 w-4 text-red-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderItem;
