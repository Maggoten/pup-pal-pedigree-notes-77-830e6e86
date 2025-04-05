
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dog, Heart, CalendarCheck, Users, BarChart } from 'lucide-react';
import { useDogs } from '@/context/DogsContext';

const BreedingStats = () => {
  const { dogs } = useDogs();
  
  // Calculate statistics
  const totalDogs = dogs.length;
  const maleCount = dogs.filter(dog => dog.gender === 'male').length;
  const femaleCount = dogs.filter(dog => dog.gender === 'female').length;
  
  let totalLitters = 0;
  let totalPuppies = 0;
  
  dogs.forEach(dog => {
    if (dog.breedingHistory?.litters) {
      totalLitters += dog.breedingHistory.litters.length;
      dog.breedingHistory.litters.forEach(litter => {
        totalPuppies += litter.puppies;
      });
    }
  });

  const stats = [
    {
      title: "Total Dogs",
      value: totalDogs,
      icon: Dog,
      color: "text-primary"
    },
    {
      title: "Males / Females",
      value: `${maleCount} / ${femaleCount}`,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Total Litters",
      value: totalLitters,
      icon: CalendarCheck,
      color: "text-green-500"
    },
    {
      title: "Total Puppies",
      value: totalPuppies,
      icon: Heart,
      color: "text-rose-500"
    }
  ];

  return (
    <Card className="border-primary/20 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <BarChart className="h-5 w-5" />
          Breeding Statistics
        </CardTitle>
        <CardDescription>
          Overview of your breeding program
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="p-3 bg-white/70 rounded-md shadow-sm border border-primary/10 flex flex-col items-center text-center"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-1`} />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.title}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingStats;
