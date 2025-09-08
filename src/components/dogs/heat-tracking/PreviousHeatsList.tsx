import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import PreviousHeatCard from './PreviousHeatCard';
import HeatDetailsDialog from './HeatDetailsDialog';
import { Dog } from '@/types/dogs';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface PreviousHeatsListProps {
  dog: Dog;
  heatCycles: HeatCycle[];
  onUpdate?: () => void;
}

const PreviousHeatsList: React.FC<PreviousHeatsListProps> = ({ dog, heatCycles, onUpdate }) => {
  const { t } = useTranslation('dogs');
  const [heatLogCounts, setHeatLogCounts] = useState<Record<string, { temp: number; prog: number }>>({});
  const [selectedHeatCycle, setSelectedHeatCycle] = useState<HeatCycle | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const heatHistory = dog.heatHistory || [];
  
  // Filter and sort completed cycles from props
  const completedHeatCycles = heatCycles
    .filter(cycle => cycle.end_date)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  useEffect(() => {
    loadHeatLogCounts();
  }, [completedHeatCycles]);

  const loadHeatLogCounts = async () => {
    setIsLoading(true);
    try {
      // Load log counts for each completed cycle
      const counts: Record<string, { temp: number; prog: number }> = {};
      for (const cycle of completedHeatCycles) {
        try {
          const logs = await HeatService.getHeatLogs(cycle.id);
          const tempCount = logs.filter(log => log.temperature !== null && log.temperature !== undefined).length;
          const progCount = logs.filter(log => log.progesterone_value !== null && log.progesterone_value !== undefined).length;
          counts[cycle.id] = { temp: tempCount, prog: progCount };
        } catch (error) {
          console.error(`Error loading logs for cycle ${cycle.id}:`, error);
          counts[cycle.id] = { temp: 0, prog: 0 };
        }
      }
      setHeatLogCounts(counts);
    } catch (error) {
      console.error('Error loading heat log counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (heatCycle: HeatCycle) => {
    setSelectedHeatCycle(heatCycle);
    setShowDetailsDialog(true);
  };

  const handleUpdate = () => {
    loadHeatLogCounts();
    onUpdate?.();
  };

  // Filter out empty legacy entries and validate data consistency
  const validLegacyHistory = heatHistory.filter(heat => heat?.date);
  const hasCompletedCycles = completedHeatCycles.length > 0;
  const hasValidLegacyHistory = validLegacyHistory.length > 0;
  const hasAnyPreviousHeats = hasCompletedCycles || hasValidLegacyHistory;

  // If we have completed cycles but legacy history is empty or invalid, 
  // migration likely occurred - don't show legacy entries
  const shouldShowLegacyHistory = hasValidLegacyHistory && (!hasCompletedCycles || validLegacyHistory.length > 0);

  if (!hasAnyPreviousHeats) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('heatTracking.previous.title')}
          </CardTitle>
          <CardDescription>
            {hasCompletedCycles && shouldShowLegacyHistory 
              ? t('heatTracking.previous.descriptionBoth', { 
                  completed: completedHeatCycles.length,
                  legacy: validLegacyHistory.length 
                })
              : hasCompletedCycles
              ? t('heatTracking.previous.descriptionCompleted', { count: completedHeatCycles.length })
              : t('heatTracking.previous.descriptionLegacy', { count: validLegacyHistory.length })
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              {t('common.loading')}...
            </div>
          ) : (
            <div className="space-y-3">
              {/* Completed Heat Cycles */}
              {completedHeatCycles.map((cycle) => (
                <PreviousHeatCard
                  key={`cycle-${cycle.id}`}
                  heatCycle={cycle}
                  temperatureCount={heatLogCounts[cycle.id]?.temp || 0}
                  progesteroneCount={heatLogCounts[cycle.id]?.prog || 0}
                  onViewDetails={() => handleViewDetails(cycle)}
                  onSuccess={handleUpdate}
                />
              ))}
              
              {/* Legacy Heat History - Only show if we should display legacy entries */}
              {shouldShowLegacyHistory && 
                validLegacyHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((heat, sortedIndex) => {
                    // Find the original index in the unsorted heatHistory array
                    const originalIndex = heatHistory.findIndex(h => h.date === heat.date);
                    return (
                      <PreviousHeatCard
                        key={`legacy-${originalIndex}`}
                        legacyHeat={heat}
                        legacyIndex={originalIndex}
                        dogId={dog.id}
                        onLegacyUpdate={handleUpdate}
                      />
                    );
                  })
              }
            </div>
          )}
        </CardContent>
      </Card>

      <HeatDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        heatCycle={selectedHeatCycle}
      />
    </>
  );
};

export default PreviousHeatsList;