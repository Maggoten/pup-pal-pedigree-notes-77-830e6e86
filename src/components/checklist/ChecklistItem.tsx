
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ChecklistItem as ChecklistItemType } from '@/types/checklist';
import { cn } from '@/lib/utils';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle }) => {
  return (
    <div className="flex items-start gap-3 py-3 group">
      <Checkbox 
        id={item.id} 
        checked={item.isCompleted} 
        onCheckedChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1">
        <label 
          htmlFor={item.id} 
          className={cn(
            "font-medium cursor-pointer flex items-center", 
            item.isCompleted && "line-through text-muted-foreground"
          )}
        >
          {item.text}
          {item.weekNumber && (
            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              Week {item.weekNumber}
            </span>
          )}
        </label>
        {item.description && (
          <p className={cn(
            "text-sm text-muted-foreground mt-1",
            item.isCompleted && "line-through opacity-70"
          )}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChecklistItem;
