import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, TrendingUp } from 'lucide-react';
import { Dog } from '@/types/dogs';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface HeatTrackingTabProps {
  dog: Dog;
}

const HeatTrackingTab: React.FC<HeatTrackingTabProps> = ({ dog }) => {
  const { t } = useTranslation('dogs');
  const heatHistory = dog.heatHistory || [];
  
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
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Heat Cycles List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('heatTracking.cycles.title')}
              </CardTitle>
              <CardDescription>
                {heatHistory.length === 1 
                  ? t('heatTracking.description', { count: heatHistory.length })
                  : t('heatTracking.descriptionPlural', { count: heatHistory.length })
                }
              </CardDescription>
            </div>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('heatTracking.cycles.startNew')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {heatHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">{t('heatTracking.cycles.empty.title')}</p>
              <p className="text-sm">{t('heatTracking.cycles.empty.description')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {heatHistory
                .filter(heat => heat.date)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((heat, index) => {
                  const heatDate = parseISO(heat.date);
                  const isRecent = differenceInDays(new Date(), heatDate) <= 30;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
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
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
            {t('heatTracking.comingSoon.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• {t('heatTracking.comingSoon.features.detailedLogging')}</p>
            <p>• {t('heatTracking.comingSoon.features.temperatureCharts')}</p>
            <p>• {t('heatTracking.comingSoon.features.enhancedPredictions')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeatTrackingTab;