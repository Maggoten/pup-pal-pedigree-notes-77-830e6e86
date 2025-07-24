import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Puppy } from '@/types/breeding';

interface PuppyMeasurementsChartProps {
  puppy: Puppy;
}

const PuppyMeasurementsChart: React.FC<PuppyMeasurementsChartProps> = ({ puppy }) => {
  const { weightChartData, heightChartData } = useMemo(() => {
    const weightData = puppy.weightLog || [];
    const heightData = puppy.heightLog || [];

    // Create separate datasets for weight and height starting from their first measurement
    const createChartData = (data: any[], dataKey: string) => {
      if (data.length === 0) return [];
      
      const dataMap = new Map();
      data.forEach(entry => {
        const dateKey = format(parseISO(entry.date), 'yyyy-MM-dd');
        dataMap.set(dateKey, { 
          date: dateKey, 
          displayDate: format(parseISO(entry.date), 'MMM d'),
          [dataKey]: entry[dataKey]
        });
      });
      
      return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    };

    return {
      weightChartData: createChartData(weightData, 'weight'),
      heightChartData: createChartData(heightData, 'height')
    };
  }, [puppy.weightLog, puppy.heightLog]);

  const hasWeightData = puppy.weightLog && puppy.weightLog.length > 0;
  const hasHeightData = puppy.heightLog && puppy.heightLog.length > 0;

  if (!hasWeightData && !hasHeightData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No measurement data available</p>
          <p className="text-sm">Add measurements to see growth charts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasWeightData && (
        <div>
          <h4 className="text-lg font-semibold mb-4">Weight Progress</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#888' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#888' }}
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`${value} kg`, 'Weight']}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasHeightData && (
        <div>
          <h4 className="text-lg font-semibold mb-4">Height Progress</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={heightChartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#888' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#888' }}
                label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`${value} cm`, 'Height']}
              />
              <Line 
                type="monotone" 
                dataKey="height" 
                stroke="hsl(var(--accent))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: 'hsl(var(--accent))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};

export default PuppyMeasurementsChart;