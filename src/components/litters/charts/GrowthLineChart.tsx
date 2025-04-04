
import React from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Puppy } from '@/types/breeding';

interface GrowthLineChartProps {
  chartData: any[];
  chartConfig: { [key: string]: any };
  logType: 'weight' | 'height';
  viewMode: 'single' | 'litter';
  selectedPuppy: Puppy | null;
  puppies: Puppy[];
}

const GrowthLineChart: React.FC<GrowthLineChartProps> = ({
  chartData,
  chartConfig,
  logType,
  viewMode,
  selectedPuppy,
  puppies
}) => {
  return (
    <div className="w-full aspect-[16/9]">
      <ChartContainer config={chartConfig}>
        <LineChart
          data={chartData}
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
              dataKey={selectedPuppy.name}
              stroke={chartConfig[selectedPuppy.name].color}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          ) : (
            puppies.map((puppy) => (
              <Line
                key={puppy.id}
                type="monotone"
                dataKey={puppy.name}
                stroke={chartConfig[puppy.name].color}
                activeDot={{ r: 4 }}
                strokeWidth={1.5}
              />
            ))
          )}
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default GrowthLineChart;
