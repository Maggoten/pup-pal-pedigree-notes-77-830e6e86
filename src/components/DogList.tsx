import React from 'react';
import { useDogs, Dog } from '@/context/DogsContext';
import DogCard from './DogCard';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
interface DogListProps {
  dogsList?: Dog[];
}
const DogList: React.FC<DogListProps> = ({
  dogsList
}) => {
  const {
    dogs: allDogs,
    setActiveDog,
    loading
  } = useDogs();
  const [search, setSearch] = useState('');
  const {
    t
  } = useTranslation('dogs');
  const navigate = useNavigate();

  // Use the provided dogsList or fall back to all dogs from context
  const dogs = dogsList || allDogs;
  const filteredDogs = dogs.filter(dog => {
    // Search filter only (removed gender filter)
    return dog.name.toLowerCase().includes(search.toLowerCase()) || dog.breed.toLowerCase().includes(search.toLowerCase());
  });
  const handleDogClick = (dog: Dog) => {
    setActiveDog(dog);
    navigate(`/my-dogs/${dog.id}/overview`);
    console.log('Clicked on dog:', dog.name);
  };

  // Enhanced skeleton loaders with fade-in/out transitions
  const LoadingSkeleton = () => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="border rounded-lg overflow-hidden shadow-sm bg-white">
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        </div>)}
    </div>;
  if (loading) {
    return <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 w-full" />
        </div>
        <LoadingSkeleton />
      </div>;
  }

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t('filters.search.placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Dogs grid */}
      {filteredDogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDogs.map((dog) => (
            <DogCard 
              key={dog.id} 
              dog={dog} 
              onClick={handleDogClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? t('list.empty.noResults') : t('list.empty.noDogs')}
          </p>
        </div>
      )}
    </div>
  );
};
export default DogList;