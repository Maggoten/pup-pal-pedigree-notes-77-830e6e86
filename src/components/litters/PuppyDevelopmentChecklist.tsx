
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
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
    getItemsByTimeline,
    isLoading,
    isSaving
  } = useChecklistData(litter, onToggleItem);
  
  const filteredItems = getFilteredItems(compact);
  const itemsByTimeline = getItemsByTimeline(filteredItems);
  
  // For compact view with no items, don't show the checklist
  if (compact && filteredItems.length === 0) {
    return null;
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <ChecklistHeader
        completedItems={completedItems}
        totalItems={totalItems}
        completionPercentage={completionPercentage}
        puppyAge={puppyAge}
        puppyWeeks={puppyWeeks}
      />
      
      <CardContent className="p-4 relative">
        {isSaving && (
          <div className="absolute top-2 right-2 z-10">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
        
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
