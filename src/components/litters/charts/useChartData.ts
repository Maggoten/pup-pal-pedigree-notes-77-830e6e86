
import { useMemo } from 'react';
import { Puppy } from '@/types/breeding';

const useChartData = (
  puppies: Puppy[],
  selectedPuppy: Puppy | null,
  viewMode: 'single' | 'litter',
  logType: 'weight' | 'height'
) => {
  // Define puppy color scheme
  const puppyColors = {
    male: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
    female: ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
  };

  // Get color for a puppy based on gender and index
  const getPuppyColor = (index: number, gender: 'male' | 'female') => {
    const colors = puppyColors[gender];
    return colors[index % colors.length];
  };

  // Generate chart data for a single puppy
  const getChartDataForSinglePuppy = (puppy: Puppy) => {
    const logData = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
    
    return logData.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      [puppy.name]: logType === 'weight' 
        ? 'weight' in entry ? entry.weight : null 
        : 'height' in entry ? entry.height : null
    }));
  };

  // Generate chart data for all puppies in a litter
  const getChartDataForLitter = () => {
    const allDates = new Set<string>();
    
    puppies.forEach(puppy => {
      const logData = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
      logData.forEach(entry => {
        allDates.add(new Date(entry.date).toLocaleDateString());
      });
    });
    
    return Array.from(allDates)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => {
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

  // Generate chart configuration based on view mode
  const chartConfig = useMemo(() => {
    const config: { [key: string]: any } = {};

    if (viewMode === 'single' && selectedPuppy) {
      config[selectedPuppy.name] = {
        label: selectedPuppy.name,
        color: getPuppyColor(0, selectedPuppy.gender),
      };
    } else {
      puppies.forEach((puppy, index) => {
        config[puppy.name] = {
          label: puppy.name,
          color: getPuppyColor(index, puppy.gender),
        };
      });
    }

    return config;
  }, [viewMode, selectedPuppy, puppies]);

  // Determine if any data is available for the chart
  const noDataAvailable = useMemo(() => {
    return viewMode === 'single' 
      ? selectedPuppy && getChartDataForSinglePuppy(selectedPuppy).length === 0
      : getChartDataForLitter().length === 0;
  }, [viewMode, selectedPuppy, puppies, logType]);

  // Generate the final chart data based on view mode
  const chartData = useMemo(() => {
    return viewMode === 'single' && selectedPuppy 
      ? getChartDataForSinglePuppy(selectedPuppy)
      : getChartDataForLitter();
  }, [viewMode, selectedPuppy, puppies, logType]);

  return {
    chartData,
    chartConfig,
    noDataAvailable,
    getChartDataForSinglePuppy,
    getChartDataForLitter
  };
};

export default useChartData;
