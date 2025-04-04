
import React from 'react';
import { LineChart, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Puppy } from '@/types/breeding';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PuppyGrowthChartProps {
  selectedPuppy: Puppy | null;
  logType: 'weight' | 'height';
  setLogType: (type: 'weight' | 'height') => void;
}

const PuppyGrowthChart: React.FC<PuppyGrowthChartProps> = ({
  selectedPuppy,
  logType,
  setLogType
}) => {
  const getChartData = () => {
    if (!selectedPuppy) return [];
    
    const logData = logType === 'weight' ? selectedPuppy.weightLog : selectedPuppy.heightLog;
    
    return logData.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      [logType]: logType === 'weight' ? entry.weight : entry.height
    }));
  };

  if (!selectedPuppy) {
    return (
      <div className="text-center py-12">
        <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a Puppy</h3>
        <p className="text-muted-foreground">Select a puppy to view growth charts</p>
      </div>
    );
  }
  
  const chartData = getChartData();
  
  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-muted-foreground">
          No {logType} data available for {selectedPuppy.name}
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-[300px] w-full">
      <ChartContainer
        config={{
          [logType]: {
            label: logType === 'weight' ? 'Weight (kg)' : 'Height (cm)',
            color: logType === 'weight' ? '#10b981' : '#3b82f6',
          }
        }}
      >
        <RechartsLineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey={logType}
            stroke={logType === 'weight' ? 'var(--color-weight, #10b981)' : 'var(--color-height, #3b82f6)'}
            activeDot={{ r: 8 }}
          />
        </RechartsLineChart>
      </ChartContainer>
    </div>
  );
};

export default PuppyGrowthChart;
