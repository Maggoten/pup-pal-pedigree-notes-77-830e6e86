import React from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line } from 'recharts';
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
  // Transform data for line chart - keep most recent data point for each puppy
  const transformedChartData = chartData.map(dataPoint => {
    const formattedDate = new Date(dataPoint.date).toLocaleDateString();
    const newDataPoint = { date: formattedDate };
    
    // Add data for each puppy to this date point
    Object.keys(dataPoint).forEach(key => {
      if (key !== 'date') {
        newDataPoint[key] = dataPoint[key];
      }
    });
    
    return newDataPoint;
  });
  
  return (
    <div className="w-full aspect-[16/9]">
      <ChartContainer config={chartConfig}>
        <LineChart
          data={transformedChartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
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
