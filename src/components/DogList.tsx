
import React from 'react';
import { useDogs, Dog } from '@/context/DogsContext';
import DogCard from './DogCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface DogListProps {
  dogsList?: Dog[];
}

const DogList: React.FC<DogListProps> = ({ dogsList }) => {
  const { dogs: allDogs, setActiveDog, loading } = useDogs();
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading your dogs...</span>
      </div>
    );
  }

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
          <p className="text-muted-foreground">
            {search ? 'No dogs found matching your criteria' : 'No dogs found. Add your first dog to get started!'}
          </p>
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
