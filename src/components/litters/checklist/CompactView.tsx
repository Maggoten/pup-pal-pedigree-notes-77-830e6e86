
import React from 'react';
import { ChecklistItem as ChecklistItemType } from './types';
import ChecklistItem from './ChecklistItem';

interface CompactViewProps {
  items: ChecklistItemType[];
  onToggle: (itemId: string) => void;
}

const CompactView: React.FC<CompactViewProps> = ({ items, onToggle }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No tasks found for the current puppy age.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {items.map(item => (
        <ChecklistItem 
          key={item.id} 
          item={item} 
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

export default CompactView;
