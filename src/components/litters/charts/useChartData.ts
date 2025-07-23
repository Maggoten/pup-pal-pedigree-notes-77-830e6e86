
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
  // Debug logging to track data flow
  console.log('useChartData - Input data:', {
    puppiesCount: puppies.length,
    selectedPuppy: selectedPuppy ? selectedPuppy.name : null,
    viewMode,
    logType,
    puppies: puppies.map(p => ({
      id: p.id,
      name: p.name,
      weightLogCount: p.weightLog?.length || 0,
      heightLogCount: p.heightLog?.length || 0,
      sampleWeightLog: p.weightLog?.slice(0, 2),
      sampleHeightLog: p.heightLog?.slice(0, 2)
    }))
  });

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
      console.log(`Processing ${logType} logs for puppy ${puppy.name}:`, {
        logCount: logData?.length || 0,
        logs: logData || []
      });
      
      if (logData && logData.length > 0) {
        logData.forEach(entry => {
          const dateKey = new Date(entry.date).toLocaleDateString();
          dateSet.add(dateKey);
          console.log(`Added date ${dateKey} from entry:`, entry);
        });
      }
    });
    
    console.log('All dates collected:', Array.from(dateSet));
    return dateSet;
  }, [puppies, logType]);

  // Convert dates to sorted array - done once and cached
  const allDates = useMemo(() => {
    const sortedDates = Array.from(allDatesSet)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    console.log('Sorted dates:', sortedDates);
    return sortedDates;
  }, [allDatesSet]);

  // Pre-process puppy data for faster lookups when generating chart data
  const puppyDataMap = useMemo(() => {
    const dataMap = new Map<string, Map<string, number>>();
    
    puppies.forEach(puppy => {
      const dateValueMap = new Map<string, number>();
      const logData = logType === 'weight' ? puppy.weightLog : puppy.heightLog;
      
      console.log(`Processing ${logType} data for puppy ${puppy.name}:`, {
        logData: logData || [],
        logCount: logData?.length || 0
      });
      
      if (logData && logData.length > 0) {
        logData.forEach(entry => {
          const dateKey = new Date(entry.date).toLocaleDateString();
          const value = logType === 'weight' 
            ? 'weight' in entry ? entry.weight : null
            : 'height' in entry ? entry.height : null;
            
          if (value !== null) {
            dateValueMap.set(dateKey, value);
            console.log(`Mapped ${dateKey} -> ${value} for puppy ${puppy.name}`);
          }
        });
      }
      
      // Use puppy.id as key instead of name to prevent duplicates
      dataMap.set(puppy.id, dateValueMap);
      console.log(`Data map for ${puppy.name}:`, Object.fromEntries(dateValueMap));
    });
    
    console.log('Complete puppy data map:', Object.fromEntries(
      Array.from(dataMap.entries()).map(([id, map]) => [id, Object.fromEntries(map)])
    ));
    
    return dataMap;
  }, [puppies, logType]);

  // Generate chart data for a single puppy - optimized with cached data
  const getChartDataForSinglePuppy = useMemo(() => {
    if (!selectedPuppy) return [];
    
    console.log(`Generating chart data for single puppy: ${selectedPuppy.name}`);
    
    // For single puppy, we only need dates that have data for this puppy
    const puppyDateMap = puppyDataMap.get(selectedPuppy.id) || new Map<string, number>();
    
    console.log(`Single puppy data map:`, Object.fromEntries(puppyDateMap));
    
    // Filter to only include dates with data for this puppy
    const chartData = Array.from(puppyDateMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, value]) => {
        // Use ID as the data key to ensure uniqueness
        const dataPoint: GrowthLogType = { date };
        dataPoint[selectedPuppy.id] = value;
        return dataPoint;
      });
    
    console.log('Single puppy chart data:', chartData);
    return chartData;
  }, [selectedPuppy, puppyDataMap]);

  // Generate chart data for all puppies in a litter - much more efficient
  const getChartDataForLitter = useMemo(() => {
    console.log('Generating chart data for litter view');
    
    const chartData = allDates.map(date => {
      const dataPoint: GrowthLogType = { date };
      
      // Use the cached map to quickly look up values for each puppy
      puppies.forEach(puppy => {
        const puppyDateMap = puppyDataMap.get(puppy.id);
        if (puppyDateMap && puppyDateMap.has(date)) {
          // Use puppy.id instead of name for the data point key
          dataPoint[puppy.id] = puppyDateMap.get(date);
        }
      });
      
      return dataPoint;
    });
    
    console.log('Litter chart data:', chartData);
    return chartData;
  }, [allDates, puppies, puppyDataMap]);

  // Generate chart configuration based on view mode - same logic but memoized
  const chartConfig = useMemo(() => {
    const config: ChartColorConfig = {};

    if (viewMode === 'single' && selectedPuppy) {
      config[selectedPuppy.id] = {
        label: selectedPuppy.name,
        color: getPuppyColor(0, selectedPuppy.gender),
      };
    } else {
      puppies.forEach((puppy, index) => {
        config[puppy.id] = {
          label: puppy.name,
          color: getPuppyColor(index, puppy.gender),
        };
      });
    }

    console.log('Chart config:', config);
    return config;
  }, [viewMode, selectedPuppy, puppies]);

  // Determine if any data is available for the chart - optimized
  const noDataAvailable = useMemo(() => {
    let hasData = false;
    
    if (viewMode === 'single' && selectedPuppy) {
      // Check if the puppy has any data in our cached map
      const puppyDateMap = puppyDataMap.get(selectedPuppy.id);
      hasData = puppyDateMap && puppyDateMap.size > 0;
    } else {
      // For litter view, check if we have any dates with data
      hasData = allDates.length > 0;
    }
    
    console.log('Data availability check:', {
      viewMode,
      selectedPuppy: selectedPuppy?.name,
      hasData,
      allDatesCount: allDates.length,
      puppyDataMapSize: puppyDataMap.size
    });
    
    return !hasData;
  }, [viewMode, selectedPuppy, puppyDataMap, allDates]);

  // Generate the final chart data based on view mode
  const chartData = useMemo(() => {
    const data = viewMode === 'single' && selectedPuppy 
      ? getChartDataForSinglePuppy
      : getChartDataForLitter;
    
    console.log('Final chart data:', {
      viewMode,
      selectedPuppy: selectedPuppy?.name,
      dataLength: data.length,
      data
    });
    
    return data;
  }, [viewMode, selectedPuppy, getChartDataForSinglePuppy, getChartDataForLitter]);

  const result = {
    chartData,
    chartConfig,
    noDataAvailable,
  };
  
  console.log('useChartData - Final result:', result);
  return result;
};

export default useChartData;
