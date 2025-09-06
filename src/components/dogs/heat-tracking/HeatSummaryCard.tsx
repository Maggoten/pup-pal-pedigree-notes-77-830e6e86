import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, Heart } from 'lucide-react';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Dog } from '@/types/dogs';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface HeatSummaryCardProps {
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
}

const HeatSummaryCard: React.FC<HeatSummaryCardProps> = ({ 
  dog,
  heatCycles, 
  heatHistory = [],
  className = "" 
}) => {
  const { t } = useTranslation('dogs');
  
  const calculateSummary = (): SummaryStats => {
    const completedCycles = heatCycles.filter(cycle => cycle.end_date);
    
    // Calculate average cycle length
    const cycleLengths = completedCycles.map(cycle => 
      differenceInDays(parseISO(cycle.end_date!), parseISO(cycle.start_date))
    );
    
    const averageCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
      : 21; // Default average
    
    // Get all heat dates (both from cycles and legacy history)
    const allHeatDates = [
      ...completedCycles.map(cycle => cycle.start_date),
      ...heatHistory.map(heat => heat.date)
    ].filter(date => date).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
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
      : dog.heatInterval || 180; // Use dog's interval or default 6 months
    
    // Find the most recent heat date
    let lastHeatDate: Date | null = null;
    if (allHeatDates.length > 0) {
      const lastDateString = allHeatDates[allHeatDates.length - 1];
      lastHeatDate = parseISO(lastDateString);
    }
    
    // Calculate next heat date and days until
    let nextHeatDate: Date | null = null;
    let daysUntilNextHeat: number | null = null;
    
    if (lastHeatDate) {
      nextHeatDate = addDays(lastHeatDate, averageInterval);
      const today = new Date();
      if (nextHeatDate > today) {
        daysUntilNextHeat = differenceInDays(nextHeatDate, today);
      }
    }
    
    return {
      averageCycleLength,
      averageInterval,
      nextHeatDate,
      daysUntilNextHeat,
      lastHeatDate,
      totalCycles: heatCycles.length + heatHistory.length
    };
  };
  
  const stats = calculateSummary();
  
  if (stats.totalCycles === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {t('heatTracking.summary.title')}
          </CardTitle>
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
          <Heart className="h-5 w-5" />
          {t('heatTracking.summary.title')} - {dog.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Cycle Length */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.averageCycleLength}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.avgCycleLength')}
            </div>
          </div>
          
          {/* Average Interval */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.averageInterval}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.analytics.avgInterval')}
            </div>
          </div>
          
          {/* Next Heat Date */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.nextHeatDate ? format(stats.nextHeatDate, 'MMM dd') : '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.summary.nextHeat')}
            </div>
          </div>
          
          {/* Days Until Next Heat */}
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.daysUntilNextHeat !== null ? stats.daysUntilNextHeat : '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('heatTracking.summary.daysUntil')}
            </div>
          </div>
        </div>
        
        {/* Next Heat Details */}
        {stats.nextHeatDate && stats.daysUntilNextHeat !== null && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {t('heatTracking.summary.predictedNext')}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {format(stats.nextHeatDate, 'MMMM dd, yyyy')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.daysUntilNextHeat === 0 
                    ? t('heatTracking.summary.today')
                    : stats.daysUntilNextHeat === 1
                    ? t('heatTracking.summary.tomorrow')
                    : t('heatTracking.summary.inDays', { days: stats.daysUntilNextHeat })
                  }
                </div>
              </div>
            </div>
            
            {stats.daysUntilNextHeat <= 7 && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  {t('heatTracking.summary.upcomingSoon')}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeatSummaryCard;