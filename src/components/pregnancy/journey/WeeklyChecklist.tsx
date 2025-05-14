
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { ChecklistItem as ChecklistItemType } from '@/types/checklist';

// Internal component for each checklist item
interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle }) => {
  return (
    <div 
      className={`flex items-center justify-between py-2 cursor-pointer ${
        item.isCompleted ? 'text-muted-foreground' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={item.isCompleted} 
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className={item.isCompleted ? 'line-through' : ''}>
          {item.text}
        </span>
      </div>
    </div>
  );
};

export interface WeeklyChecklistProps {
  checklistItems: ChecklistItemType[];
  onToggleItem: (id: string) => void;
  weekNumber: number;
}

const WeeklyChecklist: React.FC<WeeklyChecklistProps> = ({
  checklistItems,
  onToggleItem,
  weekNumber
}) => {
  const safeChecklistItems = checklistItems ?? [];

  if (safeChecklistItems.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Week {weekNumber} Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          No symptoms to track for this week
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Week {weekNumber} Symptoms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {safeChecklistItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyChecklist;
