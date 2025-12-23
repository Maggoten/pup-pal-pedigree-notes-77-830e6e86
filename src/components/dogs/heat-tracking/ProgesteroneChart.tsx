import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { format, isToday, isTomorrow, isBefore, isAfter } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, Heart, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';
import type { OptimalMatingWindow } from '@/utils/progesteroneCalculator';
import { 
  getStoredUnit, 
  convertFromNgForDisplay, 
  getUnitLabel,
  formatProgesteroneValue,
  PROGESTERONE_THRESHOLDS,
  PROGESTERONE_LEVELS,
  getProgesteroneStatus,
  type ProgesteroneUnit
} from '@/utils/progesteroneUnits';
import ProgesteroneStatusCard from './ProgesteroneStatusCard';

type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface ProgesteroneChartProps {
  heatLogs: HeatLog[];
  matingWindow?: OptimalMatingWindow;
  nextTestDate?: Date | null;
}

interface ChartData {
  date: string;
  value: number;
  valueInNg: number;
  formattedDate: string;
}

const ProgesteroneChart: React.FC<ProgesteroneChartProps> = ({ heatLogs, matingWindow, nextTestDate }) => {
  const { t } = useTranslation('dogs');
  const unit = getStoredUnit();
  const thresholds = PROGESTERONE_THRESHOLDS[unit];
  const unitLabel = getUnitLabel(unit);

  // Filter and process progesterone test data, converting to display unit
  const progesteroneData: ChartData[] = heatLogs
    .filter(log => log.test_type === 'progesterone' && log.progesterone_value !== null)
    .map(log => ({
      date: log.date,
      value: convertFromNgForDisplay(log.progesterone_value!, unit),
      valueInNg: log.progesterone_value!,
      formattedDate: format(new Date(log.date), 'MMM dd')
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (progesteroneData.length === 0) {
    return null;
  }

  // Get latest progesterone status for the status card
  const latestTest = progesteroneData[progesteroneData.length - 1];
  const latestStatus = getProgesteroneStatus(latestTest.valueInNg, unit);
  const latestTestDate = new Date(latestTest.date);

  // Get zone boundaries for the colored areas (convert to display unit)
  const getLevelBoundary = (level: number) => convertFromNgForDisplay(level, unit);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            {`${t('heatTracking.logging.progesteroneValue', { defaultValue: 'Progesterone' })}: ${payload[0].value} ${unitLabel}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper functions for mating window display
  const getConfidenceBadge = (confidence: OptimalMatingWindow['confidence']) => {
    const variants = {
      high: { variant: 'default' as const, icon: CheckCircle },
      medium: { variant: 'secondary' as const, icon: Clock },
      low: { variant: 'outline' as const, icon: AlertTriangle },
      insufficient_data: { variant: 'destructive' as const, icon: TestTube }
    };

    const config = variants[confidence];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
        <Icon className="h-3 w-3" />
        {t(`heatTracking.mating.confidence.${confidence}`, { 
          defaultValue: confidence.replace('_', ' ') 
        })}
      </Badge>
    );
  };

  const getWindowStatus = () => {
    if (!matingWindow?.startDate || !matingWindow?.endDate) {
      return { status: 'pending', color: 'text-muted-foreground' };
    }
    const now = new Date();
    if (isBefore(now, matingWindow.startDate)) {
      return { status: 'upcoming', color: 'text-blue-600' };
    } else if (isAfter(now, matingWindow.endDate)) {
      return { status: 'past', color: 'text-muted-foreground' };
    }
    return { status: 'active', color: 'text-green-600' };
  };

  const formatTimeWindow = () => {
    if (!matingWindow?.startDate || !matingWindow?.endDate) {
      return t('heatTracking.mating.windowNotDetermined', { defaultValue: 'Not yet determined' });
    }
    return `${format(matingWindow.startDate, 'MMM dd, HH:mm')} - ${format(matingWindow.endDate, 'MMM dd, HH:mm')}`;
  };

  const windowStatus = matingWindow ? getWindowStatus() : null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TestTube className="h-5 w-5" />
            {t('heatTracking.progesterone.chartTitle', { defaultValue: 'Progesterone Levels' })}
          </CardTitle>
          {matingWindow && getConfidenceBadge(matingWindow.confidence)}
        </div>
        <CardDescription>
          {t('heatTracking.progesterone.chartDescription', { 
            defaultValue: 'Track progesterone levels throughout the heat cycle.' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={progesteroneData} 
              margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              
              {/* Colored zones for progesterone levels */}
              <ReferenceArea y1={0} y2={getLevelBoundary(1)} fill="#94a3b8" fillOpacity={0.15} />
              <ReferenceArea y1={getLevelBoundary(1)} y2={getLevelBoundary(4)} fill="#3b82f6" fillOpacity={0.15} />
              <ReferenceArea y1={getLevelBoundary(4)} y2={getLevelBoundary(7)} fill="#f59e0b" fillOpacity={0.15} />
              <ReferenceArea y1={getLevelBoundary(7)} y2={getLevelBoundary(11)} fill="#f97316" fillOpacity={0.15} />
              <ReferenceArea y1={getLevelBoundary(11)} y2={getLevelBoundary(19)} fill="#22c55e" fillOpacity={0.15} />
              <ReferenceArea y1={getLevelBoundary(19)} y2={getLevelBoundary(25)} fill="#ef4444" fillOpacity={0.15} />
              
              <XAxis 
                dataKey="formattedDate" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: unitLabel, 
                  angle: -90, 
                  position: 'insideLeft',
                  className: 'fill-muted-foreground text-xs'
                }}
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine 
                y={thresholds.baseline} 
                stroke="hsl(var(--warning))" 
                strokeDasharray="5 5"
              />
              <ReferenceLine 
                y={thresholds.lhSurge} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="5 5"
              />
              
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Status Card - Shows current level and recommendations */}
        <ProgesteroneStatusCard status={latestStatus} lastTestDate={latestTestDate} />
        
        {/* Legend for zones */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-400/30"></div>
            <span>{t('heatTracking.progesterone.levels.baseline.short')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/30"></div>
            <span>{t('heatTracking.progesterone.levels.rising.short')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500/30"></div>
            <span>{t('heatTracking.progesterone.levels.ovulation.short')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500/30"></div>
            <span>{t('heatTracking.progesterone.levels.fertile.short')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/30"></div>
            <span>{t('heatTracking.progesterone.levels.optimal.short')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/30"></div>
            <span>{t('heatTracking.progesterone.levels.urgent.short')}</span>
          </div>
        </div>

        {/* Mating Window Insights - Compact */}
        {matingWindow && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Heart className="h-4 w-4 text-primary" />
              {t('heatTracking.mating.optimalWindow', { defaultValue: 'Optimal Mating Window' })}
            </h4>

            {/* Window timing + LH status in compact row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={windowStatus?.color}>{formatTimeWindow()}</span>
              </div>
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4 text-muted-foreground" />
                <span className={matingWindow.lhSurgeDetected ? 'text-green-600' : 'text-muted-foreground'}>
                  {matingWindow.lhSurgeDetected 
                    ? t('heatTracking.mating.lhSurgeDetected', { defaultValue: 'LH surge detected' })
                    : t('heatTracking.mating.lhSurgeNotDetected', { defaultValue: 'LH surge not detected' })
                  }
                </span>
              </div>
            </div>

            {/* Peak progesterone if available */}
            {matingWindow.peakProgesteroneValue && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t('heatTracking.mating.peakProgesterone', { defaultValue: 'Peak' })}:</span>
                <Badge variant="outline" className="text-xs">
                  {formatProgesteroneValue(matingWindow.peakProgesteroneValue, unit)}
                </Badge>
              </div>
            )}

            {/* Single most important alert */}
            {windowStatus?.status === 'active' && (
              <Alert className="border-green-200 bg-green-50 py-2">
                <Heart className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  {t('heatTracking.mating.activeWindow', { defaultValue: 'Optimal mating window is NOW!' })}
                </AlertDescription>
              </Alert>
            )}

            {windowStatus?.status === 'upcoming' && matingWindow.startDate && (
              <Alert className="border-blue-200 bg-blue-50 py-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  {isToday(matingWindow.startDate) 
                    ? t('heatTracking.mating.windowToday', { defaultValue: 'Window starts today' })
                    : isTomorrow(matingWindow.startDate)
                    ? t('heatTracking.mating.windowTomorrow', { defaultValue: 'Window starts tomorrow' })
                    : t('heatTracking.mating.windowUpcoming', { defaultValue: 'Window starting soon' })
                  }
                </AlertDescription>
              </Alert>
            )}

            {nextTestDate && windowStatus?.status !== 'active' && (
              <Alert className="py-2">
                <TestTube className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {t('heatTracking.mating.nextTest', { defaultValue: 'Next test' })}: {' '}
                  <strong>{isToday(nextTestDate) ? t('heatTracking.mating.testToday', { defaultValue: 'Today' }) : format(nextTestDate, 'MMM dd')}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* First recommendation only */}
            {matingWindow.recommendations.length > 0 && (
              <p className="text-xs text-muted-foreground">
                💡 {t(`heatTracking.mating.recommendationTexts.${matingWindow.recommendations[0]}`, { defaultValue: matingWindow.recommendations[0] })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgesteroneChart;