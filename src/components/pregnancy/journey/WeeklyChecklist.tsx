
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChecklistItem as ChecklistItemType } from '@/types/checklist';
import { ClipboardList } from 'lucide-react';
import ChecklistItem from '@/components/checklist/ChecklistItem';

interface WeeklyChecklistProps {
  checklistItems: ChecklistItemType[];
  onToggleItem: (itemId: string) => void;
  weekNumber: number;
}

const WeeklyChecklist: React.FC<WeeklyChecklistProps> = ({
  checklistItems,
  onToggleItem,
  weekNumber
}) => {
  // Memoize the toggle handler to prevent unnecessary re-renders
  const handleToggle = useCallback((itemId: string) => {
    onToggleItem(itemId);
  }, [onToggleItem]);
  
  if (checklistItems.length === 0) {
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
          {checklistItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={() => handleToggle(item.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(WeeklyChecklist);
