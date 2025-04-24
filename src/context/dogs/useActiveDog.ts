
import { useState, useEffect } from 'react';
import { Dog } from '@/types/dogs';

export const useActiveDog = (dogs: Dog[]) => {
  const [activeDog, setActiveDog] = useState<Dog | null>(null);

  useEffect(() => {
    if (activeDog && !dogs.some(dog => dog.id === activeDog.id)) {
      setActiveDog(null);
    }
  }, [dogs, activeDog]);

  return { activeDog, setActiveDog };
};
