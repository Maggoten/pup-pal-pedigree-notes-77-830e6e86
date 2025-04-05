
import { Puppy } from '@/types/breeding';

export interface GrowthLogType {
  date: string;
  [key: string]: any;
}

export interface ChartColorConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

export interface GrowthChartsSectionProps {
  selectedPuppy: Puppy | null;
  puppies: Puppy[];
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

export interface LogTypeToggleProps {
  logType: 'weight' | 'height';
  setLogType: (type: 'weight' | 'height') => void;
}

export interface PuppySelectProps {
  puppies: Puppy[];
  selectedPuppy: Puppy | null;
  onSelectPuppy: (puppy: Puppy | null) => void;
}
