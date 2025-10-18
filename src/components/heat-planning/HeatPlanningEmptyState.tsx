import React from 'react';
import { CalendarX, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface HeatPlanningEmptyStateProps {
  hasFilters: boolean;
  hasPlannedFilter?: boolean;
  onClearFilters?: () => void;
}

export const HeatPlanningEmptyState: React.FC<HeatPlanningEmptyStateProps> = ({
  hasFilters,
  hasPlannedFilter,
  onClearFilters,
}) => {
  const { t } = useTranslation('plannedLitters');
  
  // Determine title and description based on filters
  const getTitle = () => {
    if (hasPlannedFilter) return t('heatPlanner.empty.noPlannedLitters');
    if (hasFilters) return t('heatPlanner.empty.noMatch');
    return t('heatPlanner.empty.title');
  };
  
  const getDescription = () => {
    if (hasPlannedFilter) return t('heatPlanner.empty.noPlannedLittersDescription');
    if (hasFilters) return t('heatPlanner.empty.adjustFilters');
    return t('heatPlanner.empty.description');
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {hasFilters || hasPlannedFilter ? (
          <Filter className="h-8 w-8 text-muted-foreground" />
        ) : (
          <CalendarX className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {getTitle()}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {getDescription()}
      </p>

      {(hasFilters || hasPlannedFilter) && onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          {t('heatPlanner.filters.clearAll')}
        </Button>
      )}
    </div>
  );
};
