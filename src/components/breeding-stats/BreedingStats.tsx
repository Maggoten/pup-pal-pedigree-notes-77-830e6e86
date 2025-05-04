
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import StatisticCard, { PieChartIcon } from './StatisticCard';
import HealthDisplay from './HealthDisplay';
import YearSelector from './YearSelector';
import useBreedingStats from './useBreedingStats';

const BreedingStats = () => {
  const { stats, selectedYear, currentYear, handlePreviousYear, handleNextYear } = useBreedingStats();

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md bg-greige-50">
      <CardHeader className="bg-gradient-to-r from-greige-100 to-transparent border-b border-greige-200 pb-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-primary">
            <PieChartIcon />
            Annual Breeding Statistics
          </CardTitle>
          <CardDescription>
            Overview of your {selectedYear} breeding program
          </CardDescription>
        </div>
        
        <YearSelector 
          selectedYear={selectedYear}
          currentYear={currentYear}
          handlePreviousYear={handlePreviousYear}
          handleNextYear={handleNextYear}
        />
      </CardHeader>
      
      <CardContent className="p-8 md:p-10 space-y-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatisticCard 
            type="litters"
            value={stats.totalLitters}
            label="Total Litters"
          />
          
          <StatisticCard 
            type="puppies"
            value={stats.totalPuppies}
            label="Total Puppies"
          />
          
          <StatisticCard 
            type="dogs"
            value={stats.dogsAdded}
            label="Dogs Added"
          />
          
          <StatisticCard 
            type="averageLitter"
            value={stats.avgLitterSize}
            label="Avg. Litter Size"
          />
        </div>
        
        <HealthDisplay 
          totalLitters={stats.totalLitters}
          averageLitterSize={stats.avgLitterSize}
          selectedYear={selectedYear}
        />
      </CardContent>
    </Card>
  );
};

export default BreedingStats;
