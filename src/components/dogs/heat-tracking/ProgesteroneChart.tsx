import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';
import { 
  getStoredUnit, 
  convertFromNgForDisplay, 
  getUnitLabel,
  PROGESTERONE_THRESHOLDS 
} from '@/utils/progesteroneUnits';

type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface ProgesteroneChartProps {
  heatLogs: HeatLog[];
}

interface ChartData {
  date: string;
  value: number;
  formattedDate: string;
}

const ProgesteroneChart: React.FC<ProgesteroneChartProps> = ({ heatLogs }) => {
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
      formattedDate: format(new Date(log.date), 'MMM dd')
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (progesteroneData.length === 0) {
    return null;
  }

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

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TestTube className="h-5 w-5" />
          {t('heatTracking.progesterone.chartTitle', { defaultValue: 'Progesterone Levels' })}
        </CardTitle>
        <CardDescription>
          {t('heatTracking.progesterone.chartDescription', { 
            defaultValue: 'Track progesterone levels throughout the heat cycle. LH surge typically occurs when levels rise from <2 to >5 ng/ml.' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile-responsive chart container */}
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={progesteroneData} 
              margin={{ 
                top: 5, 
                right: 15, 
                left: 10, 
                bottom: 5 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference lines for important thresholds - dynamic based on unit */}
              <ReferenceLine 
                y={thresholds.baseline} 
                stroke="hsl(var(--warning))" 
                strokeDasharray="5 5"
                label={{ value: `${thresholds.baseline} ${unitLabel}`, position: "top" }}
              />
              <ReferenceLine 
                y={thresholds.lhSurge} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="5 5"
                label={{ value: `${thresholds.lhSurge} ${unitLabel}`, position: "top" }}
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
        
        {/* Legend - dynamic based on unit */}
        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-warning"></div>
            <span>{t('heatTracking.progesterone.baseline', { defaultValue: `${thresholds.baseline} ${unitLabel} - Baseline level` })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-destructive"></div>
            <span>{t('heatTracking.progesterone.lhSurge', { defaultValue: `${thresholds.lhSurge} ${unitLabel} - LH surge indicator` })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgesteroneChart;