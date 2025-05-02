
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatisticCard from './StatisticCard';
import HealthDisplay from './HealthDisplay';
import YearSelector from './YearSelector';
import useBreedingStats from './useBreedingStats';

const BreedingStats = () => {
  const { stats, selectedYear, currentYear, handlePreviousYear, handleNextYear } = useBreedingStats();

  return (
    <Card className="border-greige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md bg-greige-50 flex flex-col mt-8">
      <CardHeader className="bg-gradient-to-r from-greige-100 to-transparent border-b border-greige-200 pb-3 flex flex-row items-center justify-between flex-shrink-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-primary">
            <StatisticCard.PieChartIcon />
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
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
