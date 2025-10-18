import React from 'react';
import { FertileDog } from '@/types/heatPlanning';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface HeatPlanningControlsProps {
  fertileDogs: FertileDog[];
  selectedDogIds: string[];
  onSelectionChange: (dogIds: string[]) => void;
}

export const HeatPlanningControls: React.FC<HeatPlanningControlsProps> = ({
  fertileDogs,
  selectedDogIds,
  onSelectionChange,
}) => {
  const { t } = useTranslation('plannedLitters');
  
  const handleDogToggle = (dogId: string) => {
    if (selectedDogIds.includes(dogId)) {
      onSelectionChange(selectedDogIds.filter(id => id !== dogId));
    } else {
      onSelectionChange([...selectedDogIds, dogId]);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const hasFilters = selectedDogIds.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{t('heatPlanner.filters.filterDogs')}</span>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            {t('heatPlanner.filters.clearAll')}
          </Button>
        )}
      </div>

      {/* Multi-select dog buttons */}
      <div className="flex flex-wrap gap-2">
        {fertileDogs.map((dog) => {
          const isSelected = selectedDogIds.includes(dog.id);
          return (
            <Button
              key={dog.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDogToggle(dog.id)}
              className={cn(
                'h-auto py-2 px-3 transition-all duration-200',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{dog.name}</span>
                <span className="text-xs opacity-70">({dog.age} {t('heatPlanner.tooltip.years')})</span>
                {dog.needsWarning && (
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Selected count */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="font-normal">
            {t('heatPlanner.filters.selectedDogs', { count: selectedDogIds.length })}
          </Badge>
        </div>
      )}
    </div>
  );
};
