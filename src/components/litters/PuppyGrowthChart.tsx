
import React, { useEffect } from 'react';
import { Puppy } from '@/types/breeding';
import ChartViewToggle from './charts/ChartViewToggle';
import EmptyChartState from './charts/EmptyChartState';
import GrowthLineChart from './charts/GrowthLineChart';
import useChartData from './charts/useChartData';

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

  // Reset view mode to litter if no puppy is selected
  useEffect(() => {
    if (!selectedPuppy && viewMode === 'single') {
      setViewMode('litter');
    }
  }, [selectedPuppy, viewMode]);

  // Use our custom hook to get chart data
  const { chartData, chartConfig, noDataAvailable } = useChartData(
    puppies,
    selectedPuppy,
    viewMode,
    logType
  );

  // If single view mode is selected but no puppy is selected, show select puppy state
  if (viewMode === 'single' && !selectedPuppy) {
    return <EmptyChartState type="no-selection" logType={logType} />;
  }
  
  // If there's no data available, show no data state
  if (noDataAvailable) {
    return (
      <EmptyChartState 
        type="no-data" 
        logType={logType} 
        puppyName={viewMode === 'single' && selectedPuppy ? selectedPuppy.name : undefined} 
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <ChartViewToggle 
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedPuppyExists={!!selectedPuppy}
      />
      
      <GrowthLineChart
        chartData={chartData}
        chartConfig={chartConfig}
        logType={logType}
        viewMode={viewMode}
        selectedPuppy={selectedPuppy}
        puppies={puppies}
      />
    </div>
  );
};

export default PuppyGrowthChart;
