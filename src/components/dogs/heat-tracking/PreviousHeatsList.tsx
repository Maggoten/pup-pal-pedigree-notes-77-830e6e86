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
  onUpdate?: () => void;
}

const PreviousHeatsList: React.FC<PreviousHeatsListProps> = ({ dog, onUpdate }) => {
  const { t } = useTranslation('dogs');
  const [completedHeatCycles, setCompletedHeatCycles] = useState<HeatCycle[]>([]);
  const [heatLogCounts, setHeatLogCounts] = useState<Record<string, { temp: number; prog: number }>>({});
  const [selectedHeatCycle, setSelectedHeatCycle] = useState<HeatCycle | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const heatHistory = dog.heatHistory || [];

  useEffect(() => {
    loadCompletedHeatCycles();
  }, [dog.id]);

  const loadCompletedHeatCycles = async () => {
    setIsLoading(true);
    try {
      const allCycles = await HeatService.getHeatCycles(dog.id);
      const completed = allCycles.filter(cycle => cycle.end_date);
      
      // Sort by start date (newest first)
      completed.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
      
      setCompletedHeatCycles(completed);
      
      // Load log counts for each completed cycle
      const counts: Record<string, { temp: number; prog: number }> = {};
      for (const cycle of completed) {
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
      console.error('Error loading completed heat cycles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (heatCycle: HeatCycle) => {
    setSelectedHeatCycle(heatCycle);
    setShowDetailsDialog(true);
  };

  const handleUpdate = () => {
    loadCompletedHeatCycles();
    onUpdate?.();
  };

  // Combine and sort all previous heats (completed cycles + legacy history)
  const hasCompletedCycles = completedHeatCycles.length > 0;
  const hasLegacyHistory = heatHistory.length > 0;
  const hasAnyPreviousHeats = hasCompletedCycles || hasLegacyHistory;

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
            {hasCompletedCycles && hasLegacyHistory 
              ? t('heatTracking.previous.descriptionBoth', { 
                  completed: completedHeatCycles.length,
                  legacy: heatHistory.length 
                })
              : hasCompletedCycles
              ? t('heatTracking.previous.descriptionCompleted', { count: completedHeatCycles.length })
              : t('heatTracking.previous.descriptionLegacy', { count: heatHistory.length })
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
                />
              ))}
              
              {/* Legacy Heat History */}
              {heatHistory
                .filter(heat => heat.date)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((heat, index) => (
                  <PreviousHeatCard
                    key={`legacy-${index}`}
                    legacyHeat={heat}
                    legacyIndex={index}
                    dogId={dog.id}
                    onLegacyUpdate={handleUpdate}
                  />
                ))}
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