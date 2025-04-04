import React from 'react';
import { LineChart, BarChart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Puppy } from '@/types/breeding';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PuppyGrowthChartProps {
  selectedPuppy: Puppy | null;
  puppies: Puppy[];
  logType: 'weight' | 'height';
  setLogType: (type: 'weight' | 'height') => void;
}

const PuppyGrowthChart: React.FC<PuppyGrowthChartProps> = ({
  selectedPuppy,
  puppies,
  logType,
  setLogType
}) => {
  const [viewMode, setViewMode] = React.useState<'single' | 'litter'>(
    selectedPuppy ? 'single' : 'litter'
  );

  React.useEffect(() => {
    if (!selectedPuppy && viewMode === 'single') {
      setViewMode('litter');
    }
  }, [selectedPuppy, viewMode]);

  const getChartDataForSinglePuppy = (puppy: Puppy) => {
    const logData = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
    
    return logData.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      [puppy.name]: logType === 'weight' 
        ? 'weight' in entry ? entry.weight : null 
        : 'height' in entry ? entry.height : null
    }));
  };

  const getChartDataForLitter = () => {
    const allDates = new Set<string>();
    
    puppies.forEach(puppy => {
      const logData = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
      logData.forEach(entry => {
        allDates.add(new Date(entry.date).toLocaleDateString());
      });
    });
    
    return Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => {
      const dataPoint: { [key: string]: any } = { date };
      
      puppies.forEach(puppy => {
        const logData = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
        const matchingEntry = logData.find(entry => 
          new Date(entry.date).toLocaleDateString() === date
        );
        
        if (matchingEntry) {
          if (logType === 'weight' && 'weight' in matchingEntry) {
            dataPoint[puppy.name] = matchingEntry.weight;
          } else if (logType === 'height' && 'height' in matchingEntry) {
            dataPoint[puppy.name] = matchingEntry.height;
          }
        }
      });
      
      return dataPoint;
    });
  };

  if (viewMode === 'single' && !selectedPuppy) {
    return (
      <div className="text-center py-12">
        <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a Puppy</h3>
        <p className="text-muted-foreground">Select a puppy to view growth charts</p>
      </div>
    );
  }
  
  const noDataAvailable = viewMode === 'single' 
    ? selectedPuppy && getChartDataForSinglePuppy(selectedPuppy).length === 0
    : getChartDataForLitter().length === 0;
  
  if (noDataAvailable) {
    return (
      <div className="text-center py-12">
        <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-muted-foreground">
          {viewMode === 'single' && selectedPuppy
            ? `No ${logType} data available for ${selectedPuppy.name}`
            : `No ${logType} data available for any puppies in this litter`}
        </p>
      </div>
    );
  }
  
  const chartData = viewMode === 'single' && selectedPuppy 
    ? getChartDataForSinglePuppy(selectedPuppy)
    : getChartDataForLitter();
  
  const puppyColors = {
    male: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
    female: ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
  };

  const getPuppyColor = (index: number, gender: 'male' | 'female') => {
    const colors = puppyColors[gender];
    return colors[index % colors.length];
  };
  
  const chartConfig: { [key: string]: any } = {};
  
  if (viewMode === 'single' && selectedPuppy) {
    chartConfig[selectedPuppy.name] = {
      label: selectedPuppy.name,
      color: getPuppyColor(0, selectedPuppy.gender),
    };
  } else {
    puppies.forEach((puppy, index) => {
      chartConfig[puppy.name] = {
        label: puppy.name,
        color: getPuppyColor(index, puppy.gender),
      };
    });
  }
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button 
          variant={viewMode === 'single' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setViewMode('single')}
          disabled={!selectedPuppy}
        >
          Individual
        </Button>
        <Button 
          variant={viewMode === 'litter' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setViewMode('litter')}
        >
          <Users className="h-4 w-4 mr-1" />
          Whole Litter
        </Button>
      </div>
      
      <div className="w-full aspect-[16/9]">
        <ChartContainer config={chartConfig}>
          <RechartsLineChart
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
              puppies.map((puppy, index) => (
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
          </RechartsLineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default PuppyGrowthChart;
