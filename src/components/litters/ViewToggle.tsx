
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2, LayoutList } from 'lucide-react';
import { ViewType } from './LitterFilterProvider';

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({
  view,
  onViewChange
}) => {
  return (
    <ToggleGroup 
      type="single" 
      value={view} 
      onValueChange={value => {
        if (value === 'grid' || value === 'list') {
          onViewChange(value);
        }
      }}
      className="border border-moss-300 rounded-xl bg-greige-100 p-0.5"
    >
      <ToggleGroupItem 
        value="grid" 
        aria-label="Grid View" 
        className="data-[state=on]:bg-moss-600 data-[state=on]:text-white rounded-lg"
      >
        <Grid2X2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="list" 
        aria-label="List View" 
        className="data-[state=on]:bg-moss-600 data-[state=on]:text-white rounded-lg"
      >
        <LayoutList className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;
