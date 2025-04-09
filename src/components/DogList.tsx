
import React from 'react';
import { useDogs, Dog } from '@/context/DogsContext';
import DogCard from './DogCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface DogListProps {
  dogsList?: Dog[];
}

const DogList: React.FC<DogListProps> = ({ dogsList }) => {
  const { dogs: allDogs, setActiveDog } = useDogs();
  const [search, setSearch] = useState('');

  // Use the provided dogsList or fall back to all dogs from context
  const dogs = dogsList || allDogs;

  const filteredDogs = dogs.filter(dog => {
    // Search filter only (removed gender filter)
    return dog.name.toLowerCase().includes(search.toLowerCase()) || 
           dog.breed.toLowerCase().includes(search.toLowerCase());
  });

  const handleDogClick = (dog: Dog) => {
    setActiveDog(dog);
    console.log('Clicked on dog:', dog.name);
    // In a real app, we would navigate to the dog's profile page
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

export default DogList;
