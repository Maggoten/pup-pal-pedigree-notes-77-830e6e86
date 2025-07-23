
import { Puppy } from '@/types/breeding';

export interface GrowthLogType {
  date: string;
  [puppyId: string]: any;
}

export interface ChartColorConfig {
  [puppyId: string]: {
    label: string;
    color: string;
  };
}

export interface PuppyGrowthChartProps {
  selectedPuppy: Puppy | null;
  puppies: Puppy[];
  logType: 'weight' | 'height';
  setLogType: (type: 'weight' | 'height') => void;
  onSelectPuppy: (puppy: Puppy | null) => void;
}

export interface GrowthLineChartProps {
  chartData: GrowthLogType[];
  chartConfig: ChartColorConfig;
  logType: 'weight' | 'height';
  viewMode: 'single' | 'litter';
  selectedPuppy: Puppy | null;
  puppies: Puppy[];
}
