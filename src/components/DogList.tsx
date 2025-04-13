
import React, { useState, useMemo } from 'react';
import { useSupabaseDogs } from '@/context/dogs';
import DogCard from './DogCard';
import { Input } from '@/components/ui/input';
import { Dog } from '@/types/dogs';

interface DogListProps {
  dogsList?: Dog[];
}

const DogList: React.FC<DogListProps> = ({ dogsList }) => {
  const { dogs: allDogs, setActiveDog } = useSupabaseDogs();
  const [search, setSearch] = useState('');

  // Use the provided dogsList or fall back to all dogs from context
  const dogs = dogsList || allDogs;

  // Memoize filtered dogs to prevent unnecessary recalculations
  const filteredDogs = useMemo(() => {
    return dogs.filter(dog => {
      // Search filter only
      return dog.name.toLowerCase().includes(search.toLowerCase()) || 
             dog.breed.toLowerCase().includes(search.toLowerCase());
    });
  }, [dogs, search]);

  const handleDogClick = (dog: Dog) => {
    setActiveDog(dog);
    console.log('Clicked on dog:', dog.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search dogs by name or breed..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {filteredDogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No dogs found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} onClick={handleDogClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(DogList);
