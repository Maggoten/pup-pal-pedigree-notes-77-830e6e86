import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, TrendingUp, Clock, Heart, AlertCircle, Info } from 'lucide-react';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { getDayInCycle } from '@/utils/heatDateUtils';
import { parseISODate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';
import { Dog } from '@/types/dogs';
import { calculateOptimalHeatInterval } from '@/utils/heatIntervalCalculator';
import { calculateNextHeatDate } from '@/utils/heatCalculator';
import UnifiedHeatOverviewSkeleton from './UnifiedHeatOverviewSkeleton';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface UnifiedHeatOverviewProps {
  dog: Dog;
  heatCycles: HeatCycle[];
  heatHistory?: { date: string }[];
  className?: string;
  isLoading?: boolean;
}

interface SummaryStats {
  averageCycleLength: number;
  averageInterval: number;
  nextHeatDate: Date | null;
  daysUntilNextHeat: number | null;
  lastHeatDate: Date | null;
  totalCycles: number;
  shortestCycle: number;
  longestCycle: number;
  lastCycleLength: number | null;
  currentDayInCycle: number | null;
  predictedEndDate: Date | null;
  isBasedOnOngoing: boolean;
  intervalSource: 'calculated' | 'standard';
}

const UnifiedHeatOverview: React.FC<UnifiedHeatOverviewProps> = ({ 
  dog, 
  heatCycles, 
  heatHistory = [],
  className = "",
  isLoading = false
}) => {
  const { t } = useTranslation('dogs');
  

  const calculateSummary = (): SummaryStats => {
    const completedCycles = heatCycles.filter(cycle => cycle.end_date);
    const activeCycle = heatCycles.find(cycle => !cycle.end_date);
    
    // Calculate cycle lengths from completed cycles
    const cycleLengths = completedCycles.map(cycle => 
      differenceInDays(parseISO(cycle.end_date!), parseISO(cycle.start_date))
    );
    
    const averageCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
      : 21; // Default average

    const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 0;
    const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 0;
    const lastCycleLength = cycleLengths.length > 0 ? cycleLengths[cycleLengths.length - 1] : null;
    
    // Use the central heat calculation function for consistency
    const heatResult = calculateNextHeatDate(heatCycles, heatHistory, dog.id);
    
    const { 
      nextHeatDate, 
      daysUntilNextHeat, 
      intervalDays: averageInterval, 
      intervalSource,
      lastHeatDate,
      totalHeatDates
    } = heatResult;
    
    const isBasedOnOngoing = false; // Not used in current logic but kept for compatibility

    // Current cycle calculations
    let currentDayInCycle = null;
    let predictedEndDate = null;
    
    if (activeCycle) {
      currentDayInCycle = getDayInCycle(activeCycle.start_date);
      const startDate = parseISODate(activeCycle.start_date);
      predictedEndDate = addDays(startDate, averageCycleLength);
    }
    
    return {
      averageCycleLength,
      averageInterval,
      nextHeatDate,
      daysUntilNextHeat,
      lastHeatDate,
      totalCycles: totalHeatDates,
      shortestCycle,
      longestCycle,
      lastCycleLength,
      currentDayInCycle,
      predictedEndDate,
      isBasedOnOngoing,
      intervalSource
    };
  };

  const [showPhaseInfo, setShowPhaseInfo] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<any>(null);

  const getCyclePhaseInfo = (dayInCycle: number) => {
    if (dayInCycle <= 9) {
      return {
        phase: t('heatTracking.phases.proestrus'),
        color: 'bg-pink-100 text-pink-800',
        description: t('heatTracking.analytics.proestrusDescription'),
        days: '1-9',
        details: t('heatTracking.phases.details.proestrus'),
        signs: t('heatTracking.phases.signs.proestrus')
      };
    } else if (dayInCycle <= 16) {
      return {
        phase: t('heatTracking.phases.estrus'),
        color: 'bg-red-100 text-red-800',
        description: t('heatTracking.analytics.estrusDescription'),
        days: '10-16',
        details: t('heatTracking.phases.details.estrus'),
        signs: t('heatTracking.phases.signs.estrus')
      };
    } else {
      return {
        phase: t('heatTracking.phases.diestrus'),
        color: 'bg-orange-100 text-orange-800',
        description: t('heatTracking.phases.details.diestrus'),
        days: '17-21',
        details: t('heatTracking.phases.details.diestrus'),
        signs: t('heatTracking.phases.signs.diestrus')
      };
    }
  };

  const handlePhaseClick = (phaseInfo: any) => {
    setSelectedPhase(phaseInfo);
    setShowPhaseInfo(true);
  };

  // Show skeleton during loading
  if (isLoading) {
    return <UnifiedHeatOverviewSkeleton dogName={dog.name} className={className} />;
  }

  const stats = calculateSummary();
  const activeCycle = heatCycles.find(cycle => !cycle.end_date);

  if (stats.totalCycles === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {dog.name}s {t('heatTracking.analytics.cycle')}
          </CardTitle>
          <CardDescription>
            {t('heatTracking.analytics.noData')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('heatTracking.analytics.startTracking')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {dog.name}s {t('heatTracking.analytics.cycle')}
        </CardTitle>
        <CardDescription>
          {t('heatTracking.analytics.description', { count: stats.totalCycles })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Cycle Status - Only show when there's an active cycle */}
        {activeCycle && stats.currentDayInCycle && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-primary">
                {t('heatTracking.analytics.currentCycle')}
              </h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('heatTracking.analytics.dayInCycle', { day: stats.currentDayInCycle })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {t('heatTracking.analytics.dayOf', { 
                      current: stats.currentDayInCycle, 
                      total: stats.averageCycleLength 
                    })}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={`${getCyclePhaseInfo(stats.currentDayInCycle).color} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                    onClick={() => handlePhaseClick(getCyclePhaseInfo(stats.currentDayInCycle))}
                  >
                    {getCyclePhaseInfo(stats.currentDayInCycle).phase}
                    <Info className="h-3 w-3" />
                  </Badge>
                </div>
              </div>
              
              <Progress 
                value={(stats.currentDayInCycle / stats.averageCycleLength) * 100} 
                className="h-2"
              />
              
              <p className="text-xs text-muted-foreground">
                {getCyclePhaseInfo(stats.currentDayInCycle).description}
              </p>
              
              {stats.predictedEndDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('heatTracking.analytics.predictedEnd')}:
                  </span>
                  <span className="font-medium">
                    {format(stats.predictedEndDate, 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Basic Statistics Grid - Always shown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.averageCycleLength}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.avgCycleLength')}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.averageInterval}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.avgInterval')}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.nextHeatDate && !isNaN(stats.nextHeatDate.getTime()) ? format(stats.nextHeatDate, 'MMM dd') : '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.nextHeat')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.intervalSource === 'calculated' 
                ? t('heatTracking.analytics.calculatedFromHistory', 'Beräknat från tidigare löp')
                : t('heatTracking.analytics.standardEstimate', 'Uppskattning (1 år standard)')
              }
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.daysUntilNextHeat !== null ? stats.daysUntilNextHeat : '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.daysUntil')}
            </div>
          </div>
        </div>
        
        
      </CardContent>

      {/* Phase Information Dialog */}
      <Dialog open={showPhaseInfo} onOpenChange={setShowPhaseInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {selectedPhase?.phase}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className={selectedPhase?.color}>
                {t('heatTracking.phases.days')}: {selectedPhase?.days}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">
                {t('heatTracking.phases.description')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedPhase?.details || selectedPhase?.description}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">
                {t('heatTracking.phases.commonSigns')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedPhase?.signs || t('heatTracking.phases.noSignsData')}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UnifiedHeatOverview;