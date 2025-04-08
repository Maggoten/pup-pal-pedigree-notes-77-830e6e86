
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dog, Heart, PieChart, Baby, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDogs } from '@/context/DogsContext';
import { Button } from '@/components/ui/button';

const BreedingStats = () => {
  const { dogs } = useDogs();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Calculate statistics for the selected year
  const yearFilteredDogs = dogs.filter(dog => {
    const dogYear = dog.dateOfBirth ? new Date(dog.dateOfBirth).getFullYear() : 0;
    return dogYear === selectedYear;
  });
  
  // Calculate litters and puppies for the selected year
  let yearLitters = 0;
  let yearPuppies = 0;
  
  dogs.forEach(dog => {
    if (dog.breedingHistory?.litters) {
      dog.breedingHistory.litters.forEach(litter => {
        const litterYear = new Date(litter.date).getFullYear();
        if (litterYear === selectedYear) {
          yearLitters += 1;
          yearPuppies += litter.puppies;
        }
      });
    }
  });

  // Total dogs added this year
  const dogsAddedThisYear = yearFilteredDogs.length;
  
  // Average puppies per litter
  const avgPuppiesPerLitter = yearLitters > 0 ? Math.round((yearPuppies / yearLitters) * 10) / 10 : 0;

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear(prev => prev + 1);
    }
  };

  const stats = [
    {
      title: "Total Litters",
      value: yearLitters,
      icon: <Heart className="h-5 w-5 text-rose-500" />,
      color: "text-rose-500 bg-rose-50"
    },
    {
      title: "Total Puppies",
      value: yearPuppies,
      icon: <Baby className="h-5 w-5 text-amber-500" />,
      color: "text-amber-500 bg-amber-50"
    },
    {
      title: "Dogs Added",
      value: dogsAddedThisYear,
      icon: <Dog className="h-5 w-5 text-green-500" />,
      color: "text-green-500 bg-green-50"
    },
    {
      title: "Avg. Litter Size",
      value: avgPuppiesPerLitter,
      icon: <PieChart className="h-5 w-5 text-blue-500" />,
      color: "text-blue-500 bg-blue-50"
    }
  ];

  return (
    <Card className="border-greige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md h-full beige-gradient">
      <CardHeader className="bg-gradient-to-r from-greige-100 to-transparent border-b border-greige-200 pb-3 flex flex-row items-center justify-between">
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
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <div className="bg-greige-50/70 rounded-lg p-4">
            <h3 className="font-medium mb-2">Program Health</h3>
            <p className="text-sm text-muted-foreground">
              {yearLitters > 0 
                ? `Your breeding program is healthy with an average of ${avgPuppiesPerLitter} puppies per litter.` 
                : `No litters recorded for ${selectedYear}. Plan your first breeding!`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingStats;
