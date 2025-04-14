
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Dog } from '@/types/dogs';
import DogCard from './DogCard';

interface DogListProps {
  dogsList: Dog[];
  onDogClick: (dog: Dog) => void;
}

const DogList: React.FC<DogListProps> = ({ dogsList, onDogClick }) => {
  const [search, setSearch] = useState('');

  // Memoize filtered dogs to prevent unnecessary recalculations
  const filteredDogs = useMemo(() => {
    return dogsList.filter(dog => {
      // Search filter only
      return dog.name.toLowerCase().includes(search.toLowerCase()) || 
             dog.breed.toLowerCase().includes(search.toLowerCase());
    });
  }, [dogsList, search]);

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
            <DogCard 
              key={dog.id} 
              dog={dog} 
              onClick={() => onDogClick(dog)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(DogList);
