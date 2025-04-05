
import React from 'react';
import { Milestone } from 'lucide-react';
import { ChecklistItem as ChecklistItemType } from './types';
import ChecklistItem from './ChecklistItem';

interface TimelineGroupProps {
  name: string;
  items: ChecklistItemType[];
  onToggle: (itemId: string) => void;
}

const TimelineGroup: React.FC<TimelineGroupProps> = ({ name, items, onToggle }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Milestone className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">{name}</h3>
      </div>
      
      <div className="space-y-2 pl-4 border-l-2 border-primary/20">
        {items.map(item => (
          <ChecklistItem 
            key={item.id} 
            item={item} 
            onToggle={onToggle}
            showWeekBadge={true}
          />
        ))}
      </div>
    </div>
  );
};

interface TimelineViewProps {
  itemsByTimeline: Array<{ name: string; items: ChecklistItemType[] }>;
  onToggle: (itemId: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ itemsByTimeline, onToggle }) => {
  return (
    <div className="space-y-8">
      {itemsByTimeline
        .filter(segment => segment.items.length > 0)
        .map(segment => (
          <TimelineGroup
            key={segment.name}
            name={segment.name}
            items={segment.items}
            onToggle={onToggle}
          />
        ))}
      
      {itemsByTimeline.every(segment => segment.items.length === 0) && (
        <div className="text-center py-6 text-muted-foreground">
          <p>No tasks found in this category for the current puppy age.</p>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
