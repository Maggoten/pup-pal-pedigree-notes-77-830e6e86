
import React from 'react';
import { useDogs, Dog } from '@/context/DogsContext';
import DogCard from './DogCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const DogList: React.FC = () => {
  const { dogs, setActiveDog } = useDogs();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredDogs = dogs.filter(dog => {
    // Search filter
    const matchesSearch = dog.name.toLowerCase().includes(search.toLowerCase()) || 
                          dog.breed.toLowerCase().includes(search.toLowerCase());
    
    // Gender filter
    const matchesGender = filter === 'all' || dog.gender === filter;
    
    return matchesSearch && matchesGender;
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
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dogs</SelectItem>
            <SelectItem value="male">Males</SelectItem>
            <SelectItem value="female">Females</SelectItem>
          </SelectContent>
        </Select>
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
