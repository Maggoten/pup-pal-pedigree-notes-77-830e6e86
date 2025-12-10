import React, { useMemo } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { format, parseISO, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { GrowthLineChartProps } from './types';
import { puppyMilestones } from './milestoneConfig';

const GrowthLineChart: React.FC<GrowthLineChartProps> = ({
  chartData,
  chartConfig,
  logType,
  viewMode,
  selectedPuppy,
  puppies,
  litterDateOfBirth
}) => {
  const { t, i18n } = useTranslation('litters');
  
  // Get week prefix based on language
  const weekPrefix = i18n.language === 'sv' ? 'V' : 'W';

  // Transform data for line chart - format dates for display
  const transformedChartData = useMemo(() => {
    return chartData.map(dataPoint => {
      const formattedDate = format(parseISO(dataPoint.date), 'd MMM');
      const newDataPoint: Record<string, any> = { date: formattedDate };
      
      Object.keys(dataPoint).forEach(key => {
        if (key !== 'date') {
          newDataPoint[key] = dataPoint[key];
        }
      });
      
      return newDataPoint;
    });
  }, [chartData]);

  // Calculate milestone dates that fall within the chart data range
  const milestoneLines = useMemo(() => {
    if (!litterDateOfBirth || chartData.length === 0) return [];
    
    const birthDate = parseISO(litterDateOfBirth);
    const chartDates = chartData.map(d => d.date);
    const firstChartDate = chartDates[0];
    const lastChartDate = chartDates[chartDates.length - 1];
    
    return puppyMilestones
      .map(milestone => {
        const milestoneDate = addDays(birthDate, milestone.days);
        const formattedDate = format(milestoneDate, 'd MMM');
        const isoDate = format(milestoneDate, 'yyyy-MM-dd');
        
        // Check if milestone is within chart range
        if (isoDate >= firstChartDate && isoDate <= lastChartDate) {
          return {
            date: formattedDate,
            label: `${weekPrefix}${milestone.week}`,
            week: milestone.week
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [litterDateOfBirth, chartData, weekPrefix]);
  
  return (
    <div className="w-full aspect-[16/9]">
      <ChartContainer config={chartConfig}>
        <LineChart
          data={transformedChartData}
          margin={{ top: 25, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11 }}
            tickMargin={10}
          />
          <YAxis 
            label={{ 
              value: logType === 'weight' ? 'Weight (kg)' : 'Height (cm)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12 }
            }} 
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
          
          {/* Week milestone reference lines */}
          {milestoneLines.map((milestone) => (
            <ReferenceLine
              key={milestone!.week}
              x={milestone!.date}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
              label={{
                value: milestone!.label,
                position: 'top',
                fontSize: 10,
                fill: 'hsl(var(--muted-foreground))'
              }}
            />
          ))}
          
          {viewMode === 'single' && selectedPuppy ? (
            <Line
              type="monotone"
              dataKey={selectedPuppy.id}
              name={selectedPuppy.name}
              stroke={chartConfig[selectedPuppy.id]?.color || '#8884d8'}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              connectNulls={true}
            />
          ) : (
            puppies.map((puppy) => (
              <Line
                key={puppy.id}
                type="monotone"
                dataKey={puppy.id}
                name={puppy.name}
                stroke={chartConfig[puppy.id]?.color || '#8884d8'}
                activeDot={{ r: 4 }}
                strokeWidth={2}
                connectNulls={true}
                dot={false}
              />
            ))
          )}
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default GrowthLineChart;
