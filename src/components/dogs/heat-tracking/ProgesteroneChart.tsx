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
        <ProgesteroneStatusCard 
          status={latestStatus} 
          lastTestDate={latestTestDate}
          matingWindow={matingWindow}
        />
      </CardContent>
    </Card>
  );
};

export default ProgesteroneChart;