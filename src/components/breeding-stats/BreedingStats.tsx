
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import YearSelector from './YearSelector';
import StatisticCard from './StatisticCard';
import HealthDisplay from './HealthDisplay';
import { useBreedingStats } from './useBreedingStats';

/**
 * A component that displays breeding statistics for a given year
 */
const BreedingStats: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Use our custom hook to get the stats data
  const {
    totalPuppies,
    successfulLitters,
    avgLitterSize,
    healthScores,
    isLoading
  } = useBreedingStats(selectedYear);
  
  return (
    <Card className="border-warmbeige-200 hover:shadow-md transition-all duration-300 bg-warmbeige-50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Annual Breeding Statistics</CardTitle>
        <YearSelector 
          selectedYear={selectedYear} 
          onChange={setSelectedYear} 
          startYear={2020} 
          endYear={new Date().getFullYear()}
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatisticCard 
            title="Total Puppies" 
            value={isLoading ? "..." : totalPuppies} 
            icon="pawprint" 
          />
          <StatisticCard 
            title="Litters" 
            value={isLoading ? "..." : successfulLitters} 
            icon="home" 
          />
          <StatisticCard 
            title="Avg. Litter Size" 
            value={isLoading ? "..." : avgLitterSize} 
            icon="dogs" 
          />
          <StatisticCard 
            title="Health Score" 
            value={isLoading ? "..." : "View"} 
            icon="heart" 
            highlight
          />
        </div>
        
        <HealthDisplay 
          healthScores={healthScores}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default BreedingStats;
