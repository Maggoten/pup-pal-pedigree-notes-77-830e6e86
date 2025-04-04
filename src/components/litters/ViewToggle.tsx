
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2, List } from 'lucide-react';

interface ViewToggleProps {
  viewType: 'grid' | 'list';  // Changed from "view" to "viewType" to match usage
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewType, onViewChange }) => {
  return (
    <ToggleGroup type="single" value={viewType} onValueChange={(value) => {
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
