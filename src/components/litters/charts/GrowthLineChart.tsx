
import React from 'react';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Bar } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { GrowthLineChartProps } from './types';

const GrowthLineChart: React.FC<GrowthLineChartProps> = ({
  chartData,
  chartConfig,
  logType,
  viewMode,
  selectedPuppy,
  puppies
}) => {
  // Transform data for horizontal bar chart
  const transformedData = puppies.map(puppy => {
    // Find the latest log entry for this puppy
    const logEntries = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
    if (logEntries.length === 0) {
      return {
        name: puppy.name,
        value: 0,
        puppyId: puppy.id,
        color: chartConfig[puppy.id]?.color
      };
    }
    
    // Get the latest entry
    const latestEntry = [...logEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    const value = logType === 'weight' 
      ? (latestEntry as {weight: number}).weight 
      : (latestEntry as {height: number}).height;
    
    return {
      name: puppy.name,
      value: value,
      puppyId: puppy.id,
      color: chartConfig[puppy.id]?.color,
      date: new Date(latestEntry.date).toLocaleDateString()
    };
  });
  
  // Filter out puppies with no data
  const validData = transformedData.filter(item => item.value > 0);

  return (
    <div className="w-full aspect-[16/9]">
      <ChartContainer config={chartConfig}>
        <BarChart
          data={validData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            label={{ 
              value: logType === 'weight' ? 'Weight (kg)' : 'Height (cm)', 
              position: 'insideBottom',
              offset: -10,
              style: { textAnchor: 'middle', fontSize: 12 }
            }}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            tick={{ fontSize: 11 }}
            width={80}
          />
          <Tooltip content={
            <ChartTooltipContent />
          } />
          <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
          
          <Bar 
            dataKey="value" 
            name={logType === 'weight' ? 'Weight (kg)' : 'Height (cm)'}
            fill="#8884d8"
          >
            {validData.map((entry, index) => (
              <Bar 
                key={`bar-${index}`}
                dataKey="value"
                fill={entry.color || '#8884d8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default GrowthLineChart;
