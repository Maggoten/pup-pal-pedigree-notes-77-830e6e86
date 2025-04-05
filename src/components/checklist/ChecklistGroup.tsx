
import React from 'react';
import { ChecklistGroup as ChecklistGroupType } from '@/types/checklist';
import ChecklistItem from './ChecklistItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChecklistGroupProps {
  group: ChecklistGroupType;
  onToggleItem: (groupId: string, itemId: string) => void;
}

const ChecklistGroup: React.FC<ChecklistGroupProps> = ({ 
  group, 
  onToggleItem 
}) => {
  const completedCount = group.items.filter(item => item.isCompleted).length;
  const progress = Math.round((completedCount / group.items.length) * 100);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{group.title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{group.items.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2">
          <div 
            className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {group.items.map(item => (
            <ChecklistItem 
              key={item.id} 
              item={item} 
              onToggle={() => onToggleItem(group.id, item.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistGroup;
