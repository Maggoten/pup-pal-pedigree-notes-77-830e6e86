
import React from 'react';
import { format } from 'date-fns';
import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReminderItemProps {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: string;
  relatedId?: string | null;
  icon?: React.ReactNode;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean; // Added compact prop
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  id,
  title,
  description,
  dueDate,
  priority,
  icon,
  onComplete,
  onDelete,
  compact = false // Default to standard view
}) => {
  const getPriorityStyles = () => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 bg-white border rounded-md shadow-sm transition-all hover:shadow-md relative overflow-hidden",
      getPriorityStyles(),
      compact ? "py-2" : ""
    )}>
      <div className="mt-1 shrink-0">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-medium text-gray-900 mb-1", compact ? "text-sm" : "")}>
          {title}
        </h4>
        
        {!compact && (
          <p className="text-sm text-gray-600 mb-2">
            {description}
          </p>
        )}
        
        <div className="text-xs text-gray-500">
          Due: {format(dueDate, 'MMM d, yyyy')}
        </div>
      </div>
      
      <div className={cn("flex gap-2", compact ? "ml-auto" : "")}>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className="h-8 w-8 p-0 rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
          onClick={() => onComplete(id)}
          title="Mark as complete"
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Complete</span>
        </Button>
        
        {onDelete && (
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            className="h-8 w-8 p-0 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={() => onDelete(id)}
            title="Delete reminder"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReminderItem;
