
import { useMemo } from 'react';
import { Puppy } from '@/types/breeding';
import { GrowthLogType, ChartColorConfig } from './types';

interface UseChartDataResult {
  chartData: GrowthLogType[];
  chartConfig: ChartColorConfig;
  noDataAvailable: boolean;
}

const useChartData = (
  puppies: Puppy[],
  selectedPuppy: Puppy | null,
  viewMode: 'single' | 'litter',
  logType: 'weight' | 'height'
): UseChartDataResult => {
  // Define puppy color scheme - moved outside of processing functions
  const puppyColors = {
    male: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
    female: ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
  };

  // Get color for a puppy based on gender and index - kept simple
  const getPuppyColor = (index: number, gender: 'male' | 'female') => {
    const colors = puppyColors[gender];
    return colors[index % colors.length];
  };

  // Memoize all date entries for better performance when dealing with large datasets
  const allDatesSet = useMemo(() => {
    const dateSet = new Set<string>();
    
    puppies.forEach(puppy => {
      const logData = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
      logData.forEach(entry => {
        dateSet.add(new Date(entry.date).toLocaleDateString());
      });
    });
    
    return dateSet;
  }, [puppies, logType]);

  // Convert dates to sorted array - done once and cached
  const allDates = useMemo(() => {
    return Array.from(allDatesSet)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [allDatesSet]);

  // Pre-process puppy data for faster lookups when generating chart data
  const puppyDataMap = useMemo(() => {
    const dataMap = new Map<string, Map<string, number>>();
    
    puppies.forEach(puppy => {
      const dateValueMap = new Map<string, number>();
      const logData = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
      
      logData.forEach(entry => {
        const dateKey = new Date(entry.date).toLocaleDateString();
        const value = logType === 'weight' 
          ? 'weight' in entry ? entry.weight : null
          : 'height' in entry ? entry.height : null;
          
        if (value !== null) {
          dateValueMap.set(dateKey, value);
        }
      });
      
      dataMap.set(puppy.name, dateValueMap);
    });
    
    return dataMap;
  }, [puppies, logType]);

  // Generate chart data for a single puppy - optimized with cached data
  const getChartDataForSinglePuppy = useMemo(() => {
    if (!selectedPuppy) return [];
    
    // For single puppy, we only need dates that have data for this puppy
    const puppyDateMap = puppyDataMap.get(selectedPuppy.name) || new Map<string, number>();
    
    // Filter to only include dates with data for this puppy
    return Array.from(puppyDateMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, value]) => ({
        date,
        [selectedPuppy.name]: value
      }));
  }, [selectedPuppy, puppyDataMap]);

  // Generate chart data for all puppies in a litter - much more efficient
  const getChartDataForLitter = useMemo(() => {
    return allDates.map(date => {
      const dataPoint: GrowthLogType = { date };
      
      // Use the cached map to quickly look up values for each puppy
      puppies.forEach(puppy => {
        const puppyDateMap = puppyDataMap.get(puppy.name);
        if (puppyDateMap && puppyDateMap.has(date)) {
          dataPoint[puppy.name] = puppyDateMap.get(date);
        }
      });
      
      return dataPoint;
    });
  }, [allDates, puppies, puppyDataMap]);

  // Generate chart configuration based on view mode - same logic but memoized
  const chartConfig = useMemo(() => {
    const config: ChartColorConfig = {};

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

  // Determine if any data is available for the chart - optimized
  const noDataAvailable = useMemo(() => {
    if (viewMode === 'single' && selectedPuppy) {
      // Check if the puppy has any data in our cached map
      const puppyDateMap = puppyDataMap.get(selectedPuppy.name);
      return !puppyDateMap || puppyDateMap.size === 0;
    } else {
      // For litter view, check if we have any dates with data
      return allDates.length === 0;
    }
  }, [viewMode, selectedPuppy, puppyDataMap, allDates]);

  // Generate the final chart data based on view mode - same logic but uses optimized functions
  const chartData = useMemo(() => {
    return viewMode === 'single' && selectedPuppy 
      ? getChartDataForSinglePuppy
      : getChartDataForLitter;
  }, [viewMode, selectedPuppy, getChartDataForSinglePuppy, getChartDataForLitter]);

  return {
    chartData: viewMode === 'single' && selectedPuppy ? getChartDataForSinglePuppy : getChartDataForLitter,
    chartConfig,
    noDataAvailable,
  };
};

export default useChartData;
