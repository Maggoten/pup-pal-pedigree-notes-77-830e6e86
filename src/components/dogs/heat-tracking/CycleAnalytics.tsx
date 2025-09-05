import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Clock, Heart, AlertCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface CycleAnalyticsProps {
  heatCycles: HeatCycle[];
  currentCycle?: HeatCycle | null;
  dogName: string;
  className?: string;
}

interface CycleStats {
  averageCycleLength: number;
  totalCycles: number;
  shortestCycle: number;
  longestCycle: number;
  lastCycleLength: number | null;
  intervalsAverage: number;
  currentDayInCycle: number | null;
  predictedEndDate: Date | null;
}

const CycleAnalytics: React.FC<CycleAnalyticsProps> = ({ 
  heatCycles, 
  currentCycle, 
  dogName,
  className = "" 
}) => {
  const { t } = useTranslation('dogs');
  
  const calculateStats = (): CycleStats => {
    const completedCycles = heatCycles.filter(cycle => cycle.end_date);
    
    const cycleLengths = completedCycles.map(cycle => 
      differenceInDays(parseISO(cycle.end_date!), parseISO(cycle.start_date))
    );
    
    const averageCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
      : 21; // Default average
    
    const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 0;
    const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 0;
    
    // Calculate intervals between cycles
    const intervals = [];
    if (completedCycles.length > 1) {
      const sortedCycles = [...completedCycles].sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      
      for (let i = 1; i < sortedCycles.length; i++) {
        const interval = differenceInDays(
          parseISO(sortedCycles[i].start_date),
          parseISO(sortedCycles[i - 1].start_date)
        );
        intervals.push(interval);
      }
    }
    
    const intervalsAverage = intervals.length > 0 
      ? Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length)
      : 180; // Default 6 months
    
    const lastCycleLength = cycleLengths.length > 0 ? cycleLengths[cycleLengths.length - 1] : null;
    
    let currentDayInCycle = null;
    let predictedEndDate = null;
    
    if (currentCycle) {
      const startDate = parseISO(currentCycle.start_date);
      currentDayInCycle = differenceInDays(new Date(), startDate) + 1;
      predictedEndDate = new Date(startDate);
      predictedEndDate.setDate(startDate.getDate() + averageCycleLength);
    }
    
    return {
      averageCycleLength,
      totalCycles: heatCycles.length,
      shortestCycle,
      longestCycle,
      lastCycleLength,
      intervalsAverage,
      currentDayInCycle,
      predictedEndDate
    };
  };
  
  const stats = calculateStats();
  
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
  
  if (stats.totalCycles === 0) {
    return (
      <Card className={className}>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {dogName}s cykel
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
          {dogName}s cykel
        </CardTitle>
        <CardDescription>
          {t('heatTracking.analytics.description', { count: stats.totalCycles })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Cycle Status */}
        {currentCycle && stats.currentDayInCycle && (
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
        
        {/* Cycle Statistics Grid */}
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
              {stats.intervalsAverage}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.avgInterval')}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.shortestCycle || '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.shortestCycle')}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.longestCycle || '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.longestCycle')}
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

export default CycleAnalytics;