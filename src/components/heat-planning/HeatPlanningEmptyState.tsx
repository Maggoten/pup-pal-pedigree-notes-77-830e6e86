import React from 'react';
import { CalendarX, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeatPlanningEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export const HeatPlanningEmptyState: React.FC<HeatPlanningEmptyStateProps> = ({
  hasFilters,
  onClearFilters,
}) => {
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
        {hasFilters ? 'Inga tikar matchar filtret' : 'Inga avelstikar hittades'}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {hasFilters
          ? 'Prova att justera dina filterinställningar för att se fler tikar.'
          : 'Det finns inga fertila tikar (under 9 år) i systemet för tillfället. Lägg till tikar för att se löpplanering.'}
      </p>

      {hasFilters && onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Rensa filter
        </Button>
      )}
    </div>
  );
};
