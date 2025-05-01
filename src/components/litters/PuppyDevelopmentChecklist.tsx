
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useChecklistData } from './checklist/useChecklistData';
import { PuppyDevelopmentChecklistProps } from './checklist/types';
import ChecklistHeader from './checklist/ChecklistHeader';
import TimelineView from './checklist/TimelineView';
import CompactView from './checklist/CompactView';

const PuppyDevelopmentChecklist: React.FC<PuppyDevelopmentChecklistProps> = ({ 
  litter,
  onToggleItem,
  compact = false
}) => {
  const {
    puppyAge,
    puppyWeeks,
    completedItems,
    totalItems,
    completionPercentage,
    handleToggle,
    getFilteredItems,
    getItemsByTimeline
  } = useChecklistData(litter, onToggleItem);
  
  const filteredItems = getFilteredItems(compact);
  const itemsByTimeline = getItemsByTimeline(filteredItems);
  
  // For compact view with no items, don't show the checklist
  if (compact && filteredItems.length === 0) {
    return null;
  }
  
  return (
    <Card 
      className="mb-6 min-h-[200px]" 
      style={{ 
        transition: 'none',
        // Prevent layout shifts
        contain: 'content',
        // Ensure stable dimensions
        height: compact ? 'auto' : '100%',
        minHeight: compact ? '200px' : '400px'
      }}
    >
      <ChecklistHeader
        completedItems={completedItems}
        totalItems={totalItems}
        completionPercentage={completionPercentage}
        puppyAge={puppyAge}
        puppyWeeks={puppyWeeks}
      />
      
      <CardContent className="p-4">
        {compact ? (
          <CompactView items={filteredItems} onToggle={handleToggle} />
        ) : (
          <TimelineView itemsByTimeline={itemsByTimeline} onToggle={handleToggle} />
        )}
      </CardContent>
    </Card>
  );
};

export default PuppyDevelopmentChecklist;
