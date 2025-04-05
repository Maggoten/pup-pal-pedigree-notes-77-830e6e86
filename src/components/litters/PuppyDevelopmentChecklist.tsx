
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    activeCategory,
    setActiveCategory,
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
    <Card className="mb-6">
      <ChecklistHeader
        completedItems={completedItems}
        totalItems={totalItems}
        completionPercentage={completionPercentage}
        puppyAge={puppyAge}
        puppyWeeks={puppyWeeks}
      />
      
      <CardContent className="p-4">
        {!compact && (
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
              <TabsTrigger value="admin">Administrative</TabsTrigger>
            </TabsList>
          </Tabs>
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
