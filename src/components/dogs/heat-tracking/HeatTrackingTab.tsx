import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, TrendingUp, Thermometer } from 'lucide-react';
import { Dog } from '@/types/dogs';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { HeatService } from '@/services/HeatService';
import CreateHeatCycleDialog from './CreateHeatCycleDialog';
import HeatCycleCard from './HeatCycleCard';
import { EditLegacyHeatDialog } from './EditLegacyHeatDialog';
import { DeleteLegacyHeatDialog } from './DeleteLegacyHeatDialog';
import ProgesteroneChart from './ProgesteroneChart';
import OptimalMatingWindow from './OptimalMatingWindow';
import TemperatureTrendChart from './TemperatureTrendChart';
import CycleAnalytics from './CycleAnalytics';
import PreviousHeatsList from './PreviousHeatsList';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface HeatTrackingTabProps {
  dog: Dog;
}

const HeatTrackingTab: React.FC<HeatTrackingTabProps> = ({ dog }) => {
  const { t } = useTranslation('dogs');
  const heatHistory = dog.heatHistory || [];
  const [heatCycles, setHeatCycles] = useState<HeatCycle[]>([]);
  const [allTemperatureLogs, setAllTemperatureLogs] = useState<HeatLog[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHeatCycles();
  }, [dog.id]);

  const loadHeatCycles = async () => {
    setIsLoading(true);
    try {
      const cycles = await HeatService.getHeatCycles(dog.id);
      setHeatCycles(cycles);
      
      // Load all temperature logs from all cycles
      const allLogs: HeatLog[] = [];
      for (const cycle of cycles) {
        const logs = await HeatService.getHeatLogs(cycle.id);
        // Filter only temperature logs
        const temperatureLogs = logs.filter(log => log.temperature !== null && log.temperature !== undefined);
        allLogs.push(...temperatureLogs);
      }
      
      // Sort by date (oldest first for chart display)
      allLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAllTemperatureLogs(allLogs);
    } catch (error) {
      console.error('Error loading heat cycles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCycleSuccess = () => {
    loadHeatCycles();
  };
  
  // Calculate basic analytics
  const getAverageCycleLength = () => {
    if (heatHistory.length < 2) return null;
    
    const sortedHeats = [...heatHistory]
      .filter(heat => heat.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const intervals = [];
    for (let i = 1; i < sortedHeats.length; i++) {
      const daysBetween = differenceInDays(
        parseISO(sortedHeats[i].date),
        parseISO(sortedHeats[i - 1].date)
      );
      intervals.push(daysBetween);
    }
    
    return intervals.length > 0 
      ? Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length)
      : null;
  };

  const getLastHeatDate = () => {
    if (heatHistory.length === 0) return null;
    const sortedHeats = [...heatHistory]
      .filter(heat => heat.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedHeats[0]?.date || null;
  };

  const getNextPredictedHeat = () => {
    const lastHeat = getLastHeatDate();
    if (!lastHeat) return null;
    
    const intervalDays = dog.heatInterval || 180; // Default 6 months
    const nextHeatDate = new Date(parseISO(lastHeat));
    nextHeatDate.setDate(nextHeatDate.getDate() + intervalDays);
    
    return nextHeatDate;
  };

  const averageCycle = getAverageCycleLength();
  const lastHeat = getLastHeatDate();
  const nextHeat = getNextPredictedHeat();
  const daysSinceLastHeat = lastHeat ? differenceInDays(new Date(), parseISO(lastHeat)) : null;

  return (
    <div className="space-y-6">
      {/* Advanced Analytics */}
      <CycleAnalytics 
        heatCycles={heatCycles}
        currentCycle={heatCycles.find(cycle => !cycle.end_date) || null}
        dogName={dog.name}
      />

      {/* New Heat Button - Always Available */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('heatTracking.current.title')}</h2>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="touch-manipulation"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('heatTracking.cycles.newHeat')}
        </Button>
      </div>

      {/* Active Heat Cycles */}
      {heatCycles.filter(cycle => !cycle.end_date).length > 0 ? (
        <div className="space-y-4">
          {heatCycles
            .filter(cycle => !cycle.end_date)
            .map((cycle) => (
              <HeatCycleCard 
                key={cycle.id} 
                heatCycle={cycle} 
                onUpdate={loadHeatCycles}
              />
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Thermometer className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">{t('heatTracking.cycles.noActive')}</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {t('heatTracking.cycles.noActiveDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Heats - Unified List */}
      <PreviousHeatsList 
        dog={dog}
        onUpdate={loadHeatCycles}
      />

      {/* Temperature Trend Chart - Always show when data exists */}
      {allTemperatureLogs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{t('heatTracking.temperature.overallTrend')}</h2>
          <TemperatureTrendChart 
            heatLogs={allTemperatureLogs}
          />
        </div>
      )}


      <CreateHeatCycleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        dog={dog}
        onSuccess={handleStartCycleSuccess}
      />
    </div>
  );
};

export default HeatTrackingTab;