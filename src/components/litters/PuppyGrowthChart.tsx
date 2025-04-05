
import React, { useEffect } from 'react';
import { PuppyGrowthChartProps } from './charts/types';
import EmptyChartState from './charts/EmptyChartState';
import GrowthLineChart from './charts/GrowthLineChart';
import useChartData from './charts/useChartData';
import PuppySelect from './charts/PuppySelect';

const PuppyGrowthChart: React.FC<PuppyGrowthChartProps> = ({
  selectedPuppy,
  puppies,
  logType,
  setLogType,
  onSelectPuppy
}) => {
  const [viewMode, setViewMode] = React.useState<'single' | 'litter'>(
    selectedPuppy ? 'single' : 'litter'
  );

  // Update view mode when selectedPuppy changes
  useEffect(() => {
    if (selectedPuppy) {
      setViewMode('single');
    } else if (!selectedPuppy && viewMode === 'single') {
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
      <div className="flex justify-end">
        <PuppySelect 
          puppies={puppies} 
          selectedPuppy={selectedPuppy} 
          onSelectPuppy={(puppy) => {
            onSelectPuppy(puppy);
            setViewMode(puppy ? 'single' : 'litter');
          }} 
        />
      </div>
      
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
