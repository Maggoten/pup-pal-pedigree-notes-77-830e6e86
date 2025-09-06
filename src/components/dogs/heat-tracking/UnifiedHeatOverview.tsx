import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Clock, Heart, AlertCircle } from 'lucide-react';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';
import { Dog } from '@/types/dogs';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface UnifiedHeatOverviewProps {
  dog: Dog;
  heatCycles: HeatCycle[];
  heatHistory?: { date: string }[];
  className?: string;
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
}

const UnifiedHeatOverview: React.FC<UnifiedHeatOverviewProps> = ({ 
  dog, 
  heatCycles, 
  heatHistory = [],
  className = "" 
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
    
    // Get all heat dates (both from cycles and legacy history)
    const allHeatDates = [
      ...completedCycles.map(cycle => cycle.start_date),
      ...heatHistory.map(heat => heat.date)
    ].filter(date => date).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    // Add ongoing cycle start date if exists
    if (activeCycle) {
      allHeatDates.push(activeCycle.start_date);
      allHeatDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    }
    
    // Calculate intervals between consecutive heat dates
    const intervals = [];
    for (let i = 1; i < allHeatDates.length; i++) {
      const interval = differenceInDays(
        parseISO(allHeatDates[i]),
        parseISO(allHeatDates[i - 1])
      );
      intervals.push(interval);
    }
    
    const averageInterval = intervals.length > 0 
      ? Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length)
      : dog.heatInterval || 180; // Use dog's heat interval or default 6 months

    // Calculate next heat date and days until
    let nextHeatDate: Date | null = null;
    let daysUntilNextHeat: number | null = null;
    let lastHeatDate: Date | null = null;
    let isBasedOnOngoing = false;

    if (allHeatDates.length > 0) {
      const mostRecentHeatDate = parseISO(allHeatDates[allHeatDates.length - 1]);
      lastHeatDate = mostRecentHeatDate;
      
      // If there's an active cycle, use its start date + average interval
      if (activeCycle) {
        nextHeatDate = addDays(parseISO(activeCycle.start_date), averageInterval);
        isBasedOnOngoing = true;
      } else {
        // Use the most recent heat date + average interval
        nextHeatDate = addDays(mostRecentHeatDate, averageInterval);
      }
      
      // Ensure next heat date is in the future
      const today = new Date();
      if (nextHeatDate <= today) {
        nextHeatDate = addDays(today, 1);
      }
      
      daysUntilNextHeat = differenceInDays(nextHeatDate, today);
    }

    // Current cycle calculations
    let currentDayInCycle = null;
    let predictedEndDate = null;
    
    if (activeCycle) {
      const startDate = parseISO(activeCycle.start_date);
      currentDayInCycle = differenceInDays(new Date(), startDate) + 1;
      predictedEndDate = addDays(startDate, averageCycleLength);
    }
    
    return {
      averageCycleLength,
      averageInterval,
      nextHeatDate,
      daysUntilNextHeat,
      lastHeatDate,
      totalCycles: heatCycles.length + heatHistory.length,
      shortestCycle,
      longestCycle,
      lastCycleLength,
      currentDayInCycle,
      predictedEndDate,
      isBasedOnOngoing
    };
  };

  const getCyclePhaseInfo = (dayInCycle: number) => {
    if (dayInCycle <= 9) {
      return {
        phase: t('heatTracking.phases.proestrus'),
        color: 'bg-pink-100 text-pink-800',
        description: t('heatTracking.analytics.proestrusDescription')
      };
    } else if (dayInCycle <= 16) {
      return {
        phase: t('heatTracking.phases.estrus'),
        color: 'bg-red-100 text-red-800',
        description: t('heatTracking.analytics.estrusDescription')
      };
    } else {
      return {
        phase: t('heatTracking.phases.metestrus'),
        color: 'bg-orange-100 text-orange-800',
        description: t('heatTracking.analytics.metestrusDescription')
      };
    }
  };

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
                  {t('heatTracking.analytics.dayInCycle')}:
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
                    className={getCyclePhaseInfo(stats.currentDayInCycle).color}
                  >
                    {getCyclePhaseInfo(stats.currentDayInCycle).phase}
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
              {stats.nextHeatDate ? format(stats.nextHeatDate, 'MMM dd') : '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.nextHeat')}
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
        
        {/* Comparison with Previous Cycle */}
        {stats.lastCycleLength && stats.totalCycles > 1 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('heatTracking.analytics.comparison')}
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t('heatTracking.analytics.lastCycleLength')}:
                </span>
                <span className="font-medium">{stats.lastCycleLength} {t('common.days')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t('heatTracking.analytics.difference')}:
                </span>
                <span className={`font-medium ${
                  stats.lastCycleLength > stats.averageCycleLength 
                    ? 'text-orange-600' 
                    : stats.lastCycleLength < stats.averageCycleLength 
                    ? 'text-blue-600' 
                    : 'text-green-600'
                }`}>
                  {stats.lastCycleLength > stats.averageCycleLength ? '+' : ''}
                  {stats.lastCycleLength - stats.averageCycleLength} {t('common.days')}
                </span>
              </div>
            </div>
            
            {Math.abs(stats.lastCycleLength - stats.averageCycleLength) > 5 && (
              <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-xs text-warning-foreground">
                  {t('heatTracking.analytics.significantDifference')}
                </p>
              </div>
            )}
          </div>
        )}
        
      </CardContent>
    </Card>
  );
};

export default UnifiedHeatOverview;