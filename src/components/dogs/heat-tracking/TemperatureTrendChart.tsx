import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Database } from '@/integrations/supabase/types';

type HeatLog = Database['public']['Tables']['heat_logs']['Row'];

interface TemperatureTrendChartProps {
  heatLogs: HeatLog[];
  className?: string;
}

interface ChartData {
  date: string;
  temperature: number;
  formattedDate: string;
  dayInCycle: number;
}

const TemperatureTrendChart: React.FC<TemperatureTrendChartProps> = ({ 
  heatLogs, 
  className = "" 
}) => {
  const { t } = useTranslation('dogs');

  // Filter and process temperature data
  const temperatureData: ChartData[] = heatLogs
    .filter(log => log.test_type === 'temperature' && log.temperature !== null)
    .map((log, index) => ({
      date: log.date,
      temperature: log.temperature!,
      formattedDate: format(new Date(log.date), 'MMM dd'),
      dayInCycle: index + 1 // Simplified day calculation
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (temperatureData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Thermometer className="h-5 w-5" />
            {t('heatTracking.temperature.chartTitle')}
          </CardTitle>
          <CardDescription>
            {t('heatTracking.temperature.noData')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Thermometer className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('heatTracking.temperature.startTracking')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average temperature and detect temperature drop
  const avgTemp = temperatureData.reduce((sum, data) => sum + data.temperature, 0) / temperatureData.length;
  const tempDrop = temperatureData.find((data, index) => {
    if (index === 0) return false;
    const prevTemp = temperatureData[index - 1].temperature;
    return data.temperature < prevTemp - 0.5; // 0.5°C drop indicator
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            {`${t('heatTracking.logging.temperature')}: ${payload[0].value}°C`}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('heatTracking.temperature.dayInCycle', { day: data.dayInCycle })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Thermometer className="h-5 w-5" />
          {t('heatTracking.temperature.chartTitle')}
        </CardTitle>
        <CardDescription>
          {t('heatTracking.temperature.chartDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile-responsive chart container */}
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={temperatureData} 
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
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                label={{ 
                  value: '°C', 
                  angle: -90, 
                  position: 'insideLeft',
                  className: 'fill-muted-foreground text-xs'
                }}
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference line for average temperature */}
              <ReferenceLine 
                y={avgTemp} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="2 2"
              />
              
              {/* Temperature drop indicator */}
              {tempDrop && (
                <ReferenceLine 
                  x={tempDrop.formattedDate}
                  stroke="hsl(var(--warning))" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: t('heatTracking.temperature.dropDetected'), 
                    position: "top",
                    className: "text-xs fill-warning"
                  }}
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Insights section */}
        <div className="mt-4 space-y-3">
          {/* Average temperature */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('heatTracking.temperature.averageTemp')}:
            </span>
            <span className="font-medium">{avgTemp.toFixed(1)}°C</span>
          </div>
          
          {/* Temperature drop indicator */}
          {tempDrop && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold text-warning-foreground">
                  {t('heatTracking.temperature.dropDetected')}
                </span>
              </div>
              <p className="text-xs text-warning-foreground/80">
                {t('heatTracking.temperature.dropDescription', { 
                  date: tempDrop.formattedDate,
                  temp: tempDrop.temperature.toFixed(1)
                })}
              </p>
            </div>
          )}
          
          {/* Mobile-optimized legend */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary"></div>
              <span>{t('heatTracking.temperature.bodyTemperature')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-muted-foreground opacity-50" style={{ borderTop: '1px dashed' }}></div>
              <span>{t('heatTracking.temperature.averageLine')}</span>
            </div>
            {tempDrop && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-warning" style={{ borderTop: '2px dashed' }}></div>
                <span>{t('heatTracking.temperature.ovulationIndicator')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureTrendChart;