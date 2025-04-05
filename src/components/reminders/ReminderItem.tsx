
import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ReminderItemProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  type: string;
  relatedId?: string;
  onComplete: (id: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  id,
  title,
  description,
  icon,
  priority,
  dueDate,
  type,
  relatedId,
  onComplete
}) => {
  const navigate = useNavigate();
  
  const priorityStyles = {
    high: 'bg-rose-50 border-rose-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-blue-50 border-blue-200'
  };

  const isNavigable = relatedId && (
    type === 'heat' || 
    type === 'vaccination' || 
    type === 'deworming' || 
    type === 'birthday'
  );
  
  const handleViewDetails = () => {
    if (!relatedId) return;
    
    if (type === 'heat' || type === 'vaccination' || type === 'deworming' || type === 'birthday') {
      // Navigate to dog details
      navigate(`/my-dogs/${relatedId}`);
    } else if (type === 'weighing' || type === 'vet-visit') {
      // Navigate to litter details
      navigate(`/my-litters?litterId=${relatedId}`);
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg border flex flex-col items-start justify-between ${priorityStyles[priority]}`}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="mt-1">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {dueDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Due: {format(dueDate, 'MMM d, yyyy')}
            </p>
          )}
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 rounded-full flex-shrink-0"
          onClick={() => onComplete(id)}
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Mark as complete</span>
        </Button>
      </div>
      
      {isNavigable && (
        <div className="ml-8 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs flex items-center gap-1 -ml-2"
            onClick={handleViewDetails}
          >
            <ExternalLink className="h-3 w-3" />
            View Details
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReminderItem;
