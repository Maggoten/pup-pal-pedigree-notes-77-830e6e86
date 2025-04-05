
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChecklistItem as ChecklistItemType } from './types';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (itemId: string) => void;
  showWeekBadge?: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  item, 
  onToggle,
  showWeekBadge = false
}) => {
  return (
    <div 
      className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => onToggle(item.id)}
    >
      {item.isCompleted ? (
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        {showWeekBadge ? (
          <div className="flex justify-between">
            <div className="font-medium">{item.title}</div>
            <Badge variant="outline" className="text-xs">Week {item.weekNumber}</Badge>
          </div>
        ) : (
          <div className="font-medium">{item.title}</div>
        )}
        <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
      </div>
    </div>
  );
};

export default ChecklistItem;
