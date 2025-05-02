
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dog, Heart, PieChart, Baby, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDogs } from '@/context/DogsContext';
import { Button } from '@/components/ui/button';

const BreedingStats = () => {
  const { dogs } = useDogs();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Calculate statistics for the selected year
  const stats = useMemo(() => {
    // Calculate dogs added this year
    const dogsAddedThisYear = dogs.filter(dog => {
      if (!dog.dateOfBirth) return false;
      const dogYear = new Date(dog.dateOfBirth).getFullYear();
      return dogYear === selectedYear;
    }).length;

    // Calculate litters and puppies for the selected year
    let yearLitters = 0;
    let yearPuppies = 0;
    
    // Iterate through each dog's breeding history to find litters in the selected year
    dogs.forEach(dog => {
      if (dog.breedingHistory?.litters) {
        dog.breedingHistory.litters.forEach(litter => {
          const litterDate = litter.date ? new Date(litter.date) : null;
          if (litterDate && litterDate.getFullYear() === selectedYear) {
            yearLitters += 1;
            yearPuppies += litter.puppies || 0;
          }
        });
      }
    });

    // Average puppies per litter
    const avgPuppiesPerLitter = yearLitters > 0 
      ? Math.round((yearPuppies / yearLitters) * 10) / 10 
      : 0;
    
    return {
      totalLitters: yearLitters,
      totalPuppies: yearPuppies, 
      dogsAdded: dogsAddedThisYear,
      avgLitterSize: avgPuppiesPerLitter
    };
  }, [dogs, selectedYear]);

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear(prev => prev + 1);
    }
  };

  return (
    <Card className="border-greige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md bg-greige-50 flex flex-col mt-8">
      <CardHeader className="bg-gradient-to-r from-greige-100 to-transparent border-b border-greige-200 pb-3 flex flex-row items-center justify-between flex-shrink-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-primary">
            <PieChart className="h-5 w-5" />
            Annual Breeding Statistics
          </CardTitle>
          <CardDescription>
            Overview of your {selectedYear} breeding program
          </CardDescription>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={handlePreviousYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">{selectedYear}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={handleNextYear}
            disabled={selectedYear >= currentYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-rose-500 bg-rose-50">
              <Heart className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold">{stats.totalLitters}</div>
            <div className="text-sm text-muted-foreground">Total Litters</div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-amber-500 bg-amber-50">
              <Baby className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold">{stats.totalPuppies}</div>
            <div className="text-sm text-muted-foreground">Total Puppies</div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-green-500 bg-green-50">
              <Dog className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold">{stats.dogsAdded}</div>
            <div className="text-sm text-muted-foreground">Dogs Added</div>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-blue-500 bg-blue-50">
              <PieChart className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold">{stats.avgLitterSize}</div>
            <div className="text-sm text-muted-foreground">Avg. Litter Size</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="bg-greige-50/70 rounded-lg p-4">
            <h3 className="font-medium mb-2">Program Health</h3>
            <p className="text-sm text-muted-foreground">
              {stats.totalLitters > 0 
                ? `Your breeding program is healthy with an average of ${stats.avgLitterSize} puppies per litter.` 
                : `No litters recorded for ${selectedYear}. Plan your first breeding!`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingStats;
