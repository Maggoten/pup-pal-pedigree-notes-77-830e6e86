import React from 'react';
import { FertileDog } from '@/types/heatPlanning';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeatPlanningControlsProps {
  fertileDogs: FertileDog[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const HeatPlanningControls: React.FC<HeatPlanningControlsProps> = ({
  fertileDogs,
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useTranslation('plannedLitters');
  
  const filteredCount = searchQuery 
    ? fertileDogs.filter(dog => 
        dog.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).length
    : fertileDogs.length;

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('heatPlanner.search.placeholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results count */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          {t('heatPlanner.search.results', { count: filteredCount })}
        </div>
      )}
    </div>
  );
};
