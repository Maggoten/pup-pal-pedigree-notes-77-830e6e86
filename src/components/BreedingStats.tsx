
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paw, Heart, CalendarCheck, Users } from 'lucide-react';
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
      icon: Paw,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BreedingStats;
