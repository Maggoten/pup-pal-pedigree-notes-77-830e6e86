
import React, { useState, memo } from 'react';
import { format, isBefore, addDays } from 'date-fns';
import { Check, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderItemProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  type: string;
  relatedId?: string;
  isCompleted?: boolean;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

// Use memo to prevent unnecessary re-renders
const ReminderItem: React.FC<ReminderItemProps> = memo(({
  id,
  title,
  description,
  icon,
  priority,
  dueDate,
  isCompleted = false,
  onComplete,
  onDelete,
  compact = false
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine if overdue (due date is before now and not completed)
  const isOverdue = !isCompleted && isBefore(new Date(dueDate), new Date());
  
  // Determine if due soon (due in next 2 days and not completed)
  const isDueSoon = !isCompleted && 
    !isOverdue && 
    isBefore(new Date(dueDate), addDays(new Date(), 2));
  
  // Handle completion toggle
  const handleComplete = () => {
    onComplete(id);
  };
  
  // Handle delete with confirmation state
  const handleDelete = () => {
    if (isDeleting) {
      onDelete?.(id);
    } else {
      setIsDeleting(true);
      // Reset delete state after 3 seconds if not confirmed
      setTimeout(() => {
        setIsDeleting(false);
      }, 3000);
    }
  };
  
  // Format date based on compact view
  const formattedDate = format(new Date(dueDate), compact ? 'MMM d' : 'MMM d, yyyy');
  
  return (
    <div
      className={cn(
        "p-3 transition-colors relative",
        isCompleted ? "bg-primary/5" : "hover:bg-primary/5",
        compact ? "py-2" : "py-3"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Priority indicator and toggle */}
        <div className="mt-1 flex-shrink-0">
          <button
            onClick={handleComplete}
            className={cn(
              "h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors",
              isCompleted ? "bg-green-500 border-green-600" : "border-greige-300 hover:border-primary/70",
              priority === 'high' && !isCompleted ? "border-rose-400" : "",
              priority === 'medium' && !isCompleted ? "border-amber-400" : "",
              priority === 'low' && !isCompleted ? "border-green-400" : ""
            )}
          >
            {isCompleted && <Check className="h-3 w-3 text-white" />}
          </button>
        </div>
        
        {/* Content */}
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
        
        {/* Delete button (only shown if onDelete is provided and not in compact view) */}
        {onDelete && !compact && (
          <button
            onClick={handleDelete}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded-full",
              isDeleting ? "bg-red-500 text-white" : "text-gray-400 hover:text-red-500"
            )}
          >
            {isDeleting ? <X className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  );
});

ReminderItem.displayName = 'ReminderItem';

export default ReminderItem;
