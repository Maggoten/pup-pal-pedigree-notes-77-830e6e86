
import React, { useState, memo } from 'react';
import { isBefore, isToday, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import PriorityIndicator from './PriorityIndicator';
import DeleteButton from './DeleteButton';
import ReminderContent from './ReminderContent';
import { ReminderItemProps } from './types';

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
  const isOverdue = !isCompleted && isBefore(new Date(dueDate), new Date()) && !isToday(new Date(dueDate));
  
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
          <PriorityIndicator 
            priority={priority}
            isCompleted={isCompleted}
            onClick={handleComplete}
          />
        </div>
        
        {/* Content */}
        <ReminderContent 
          title={title}
          description={description}
          icon={icon}
          dueDate={dueDate}
          isCompleted={isCompleted}
          isOverdue={isOverdue}
          isDueSoon={isDueSoon}
          compact={compact}
        />
        
        {/* Delete button (only shown if onDelete is provided and not in compact view) */}
        {onDelete && !compact && (
          <DeleteButton 
            isDeleting={isDeleting}
            onClick={handleDelete}
          />
        )}
      </div>
    </div>
  );
});

ReminderItem.displayName = 'ReminderItem';

export default ReminderItem;
