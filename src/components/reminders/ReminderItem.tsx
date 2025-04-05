
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReminderItemProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  onComplete: (id: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({
  id,
  title,
  description,
  icon,
  priority,
  onComplete
}) => {
  const priorityStyles = {
    high: 'bg-rose-50 border-rose-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-blue-50 border-blue-200'
  };

  return (
    <div 
      className={`p-4 rounded-lg border flex items-start justify-between ${priorityStyles[priority]}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">{icon}</div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 p-0 rounded-full"
        onClick={() => onComplete(id)}
      >
        <Check className="h-4 w-4" />
        <span className="sr-only">Mark as complete</span>
      </Button>
    </div>
  );
};

export default ReminderItem;
