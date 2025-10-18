import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeatPlanningListView } from './HeatPlanningListView';
import { HeatPlanningControls } from './HeatPlanningControls';
import { HeatPlanningListSkeleton } from './HeatPlanningListSkeleton';
import { HeatPlanningEmptyState } from './HeatPlanningEmptyState';
import { useMultiYearHeatPredictions } from '@/hooks/heat/useMultiYearHeatPredictions';
import { Dog } from '@/types/dogs';
import { PlannedLitter } from '@/types/breeding';
import { CalendarHeart } from 'lucide-react';

interface HeatPlanningSectionProps {
  dogs: Dog[];
  plannedLitters: PlannedLitter[];
}

export const HeatPlanningSection: React.FC<HeatPlanningSectionProps> = ({ 
  dogs, 
  plannedLitters 
}) => {
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
  
  const { predictions, fertileDogs, isLoading, error } = useMultiYearHeatPredictions(
    dogs,
    plannedLitters
  );

  const handleDogSelection = (dogIds: string[]) => {
    setSelectedDogIds(dogIds);
  };

  // Filter predictions based on selection
  const filteredPredictions = selectedDogIds.length > 0
    ? new Map(
        Array.from(predictions.entries()).filter(([dogId]) => 
          selectedDogIds.includes(dogId)
        )
      )
    : predictions;

  const filteredFertileDogs = selectedDogIds.length > 0
    ? fertileDogs.filter(dog => selectedDogIds.includes(dog.id))
    : fertileDogs;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarHeart className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Löpplanering</CardTitle>
        </div>
        <CardDescription>
          Översikt över förväntade löp kommande 3 år
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filter Controls */}
        <HeatPlanningControls
          fertileDogs={fertileDogs}
          selectedDogIds={selectedDogIds}
          onSelectionChange={handleDogSelection}
        />

        {/* Loading State */}
        {isLoading && <HeatPlanningListSkeleton />}

        {/* Error State */}
        {error && (
          <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
            Ett fel uppstod: {error.message}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredFertileDogs.length === 0 && (
          <HeatPlanningEmptyState hasFilters={selectedDogIds.length > 0} />
        )}

        {/* List View */}
        {!isLoading && !error && filteredFertileDogs.length > 0 && (
          <HeatPlanningListView
            predictions={filteredPredictions}
            fertileDogs={filteredFertileDogs}
          />
        )}
      </CardContent>
    </Card>
  );
};
