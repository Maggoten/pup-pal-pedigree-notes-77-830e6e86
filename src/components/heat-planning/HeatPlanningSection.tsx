import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeatPlanningListView } from './HeatPlanningListView';
import { HeatPlanningControls } from './HeatPlanningControls';
import { HeatPlanningListSkeleton } from './HeatPlanningListSkeleton';
import { HeatPlanningEmptyState } from './HeatPlanningEmptyState';
import { HeatPlanningLegend } from './HeatPlanningLegend';
import MatingTipsDialog from '@/components/planned-litters/MatingTipsDialog';
import { useMultiYearHeatPredictions } from '@/hooks/heat/useMultiYearHeatPredictions';
import { Dog } from '@/types/dogs';
import { PlannedLitter } from '@/types/breeding';
import { CalendarHeart, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeatPlanningSectionProps {
  dogs: Dog[];
  plannedLitters: PlannedLitter[];
}

export const HeatPlanningSection: React.FC<HeatPlanningSectionProps> = ({ 
  dogs, 
  plannedLitters 
}) => {
  const { t } = useTranslation('plannedLitters');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlannedOnly, setShowPlannedOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tipsDialogOpen, setTipsDialogOpen] = useState(false);
  
  const { predictions, fertileDogs, isLoading, error } = useMultiYearHeatPredictions(
    dogs,
    plannedLitters
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Filter predictions based on search and planned filter
  const filteredFertileDogs = fertileDogs.filter(dog => {
    // Search filter
    if (searchQuery && !dog.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Planned filter
    if (showPlannedOnly) {
      const dogPredictions = predictions.get(dog.id) || [];
      if (!dogPredictions.some(p => p.hasPlannedLitter)) {
        return false;
      }
    }
    
    return true;
  });

  const filteredPredictions = searchQuery
    ? new Map(
        Array.from(predictions.entries()).filter(([dogId]) => 
          filteredFertileDogs.some(dog => dog.id === dogId)
        )
      )
    : predictions;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarHeart className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">{t('heatPlanner.title')}</CardTitle>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setTipsDialogOpen(true)}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {t('matingTips.title')}
          </Button>
        </div>
        <CardDescription>
          {t('heatPlanner.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Controls */}
        <HeatPlanningControls
          fertileDogs={fertileDogs}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          showPlannedOnly={showPlannedOnly}
          onTogglePlannedFilter={() => setShowPlannedOnly(!showPlannedOnly)}
        />

        {/* Loading State */}
        {isLoading && <HeatPlanningListSkeleton />}

        {/* Error State */}
        {error && (
          <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
            {t('heatPlanner.error')}: {error.message}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredFertileDogs.length === 0 && (
          <HeatPlanningEmptyState 
            hasFilters={!!searchQuery}
            hasPlannedFilter={showPlannedOnly}
            onClearFilters={() => {
              setSearchQuery('');
              setShowPlannedOnly(false);
            }}
          />
        )}

        {/* List View */}
        {!isLoading && !error && filteredFertileDogs.length > 0 && (
          <>
            <HeatPlanningListView
              predictions={filteredPredictions}
              fertileDogs={filteredFertileDogs}
              onRefresh={handleRefresh}
            />
            <HeatPlanningLegend />
          </>
        )}
      </CardContent>

      {/* Mating Tips Dialog */}
      <MatingTipsDialog 
        open={tipsDialogOpen} 
        onOpenChange={setTipsDialogOpen} 
      />
    </Card>
  );
};
