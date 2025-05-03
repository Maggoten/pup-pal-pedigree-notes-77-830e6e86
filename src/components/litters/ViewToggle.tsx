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
  return <ToggleGroup type="single" value={view} onValueChange={value => {
    if (value === 'grid' || value === 'list') {
      onViewChange(value);
    }
  }}>
      <ToggleGroupItem value="grid" aria-label="Grid View">
        
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List View">
        <LayoutList className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>;
};
export default ViewToggle;