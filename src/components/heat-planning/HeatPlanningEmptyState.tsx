import React from 'react';
import { CalendarX, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface HeatPlanningEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export const HeatPlanningEmptyState: React.FC<HeatPlanningEmptyStateProps> = ({
  hasFilters,
  onClearFilters,
}) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {hasFilters ? (
          <Filter className="h-8 w-8 text-muted-foreground" />
        ) : (
          <CalendarX className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters ? t('heatPlanner.empty.noMatch') : t('heatPlanner.empty.title')}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {hasFilters
          ? t('heatPlanner.empty.adjustFilters')
          : t('heatPlanner.empty.description')}
      </p>

      {hasFilters && onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          {t('heatPlanner.filters.clearAll')}
        </Button>
      )}
    </div>
  );
};
