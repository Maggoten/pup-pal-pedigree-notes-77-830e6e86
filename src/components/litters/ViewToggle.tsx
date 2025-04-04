
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';  // Changed from viewType to view to match usage in LitterFilterControls
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <ToggleGroup type="single" value={view} onValueChange={(value) => {
      if (value) onViewChange(value as 'grid' | 'list');
    }}>
      <ToggleGroupItem value="grid" aria-label="Grid View">
        <Grid2X2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List View">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;
