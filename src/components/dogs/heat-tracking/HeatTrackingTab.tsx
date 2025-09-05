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
import DeleteConfirmationDialog from '@/components/litters/puppies/DeleteConfirmationDialog';
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

      {/* Quick Stats Cards for Mobile - Only show if no heat cycles */}
      {heatCycles.length === 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('heatTracking.analytics.averageCycle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">
                {averageCycle ? `${averageCycle} ${t('display.fields.days')}` : t('heatTracking.analytics.unknown', 'N/A')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {heatHistory.length < 2 ? t('heatTracking.analytics.needTwoCycles') : t('heatTracking.analytics.basedOnHistory')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('heatTracking.analytics.lastHeat')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">
                {daysSinceLastHeat !== null ? t('heatTracking.analytics.daysAgo', { days: daysSinceLastHeat }) : t('heatTracking.analytics.never')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lastHeat ? format(parseISO(lastHeat), 'MMM dd, yyyy') : t('heatTracking.analytics.noRecords')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('heatTracking.analytics.nextPredicted')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">
                {nextHeat ? format(nextHeat, 'MMM dd') : t('heatTracking.analytics.unknown')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextHeat ? t('heatTracking.analytics.days', { days: differenceInDays(nextHeat, new Date()) }) : t('heatTracking.analytics.noData')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Heat Cycles List */}
      <div className="space-y-6">
        {heatCycles.length > 0 ? (
          <>
            {heatCycles.map((cycle) => (
              <HeatCycleCard 
                key={cycle.id} 
                heatCycle={cycle} 
                onUpdate={loadHeatCycles}
              />
            ))}
            
            {/* Temperature Trend Chart - moved to bottom */}
            {allTemperatureLogs.length > 0 && (
              <TemperatureTrendChart 
                heatLogs={allTemperatureLogs}
                className="mt-6"
              />
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {dog.name}'s {t('heatTracking.cycles.title')}
                  </CardTitle>
                  <CardDescription>
                    {heatHistory.length === 1 
                      ? t('heatTracking.description', { count: heatHistory.length })
                      : t('heatTracking.descriptionPlural', { count: heatHistory.length })
                    }
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    {t('heatTracking.cycles.newHeat')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(heatHistory.length === 0 && heatCycles.length === 0) ? (
                <div className="text-center py-12">
                  <Thermometer className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">{t('heatTracking.cycles.noData')}</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    {t('heatTracking.cycles.getStarted')}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('heatTracking.cycles.startTracking')}
                  </Button>
                </div>
              ) : heatHistory.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    {t('heatTracking.legacySystem.title')}
                  </div>
                  {heatHistory
                    .filter(heat => heat.date)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((heat, index) => {
                      const heatDate = parseISO(heat.date);
                      const isRecent = differenceInDays(new Date(), heatDate) <= 30;
                      
                      return (
                        <div
                          key={index}
                          className="group flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div>
                              <p className="font-medium">
                                {format(heatDate, 'MMMM dd, yyyy')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t('heatTracking.analytics.daysAgo', { days: differenceInDays(new Date(), heatDate) })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isRecent && (
                              <Badge variant="secondary" className="text-xs">
                                {t('heatTracking.cycles.badges.recent')}
                              </Badge>
                            )}
                            {index === 0 && (
                              <Badge variant="default" className="text-xs">
                                {t('heatTracking.cycles.badges.latest')}
                              </Badge>
                            )}
                            <EditLegacyHeatDialog
                              dogId={dog.id}
                              heatIndex={index}
                              currentDate={heat.date}
                              onSuccess={handleStartCycleSuccess}
                            />
                            <DeleteLegacyHeatDialog
                              dogId={dog.id}
                              heatIndex={index}
                              heatDate={heat.date}
                              onSuccess={handleStartCycleSuccess}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>


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