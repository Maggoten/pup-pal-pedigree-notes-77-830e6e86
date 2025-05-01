
import { useLitterQueries } from './useLitterQueries';
import { useLitterMutations } from './useLitterMutations';
import { usePuppyMutations } from './usePuppyMutations';
import { Litter, Puppy } from '@/types/breeding';

export function useLittersQuery() {
  // Combine queries and mutations from separate hooks
  const { 
    activeLitters, 
    archivedLitters, 
    isLoading, 
    isError,
    refetch,
    getAvailableYears
  } = useLitterQueries();
  
  const { 
    addLitter,
    updateLitter,
    deleteLitter,
    archiveLitter
  } = useLitterMutations();
  
  const {
    addPuppy: addPuppyBase,
    updatePuppy: updatePuppyBase,
    deletePuppy
  } = usePuppyMutations();
  
  // Create wrappers with the same API as before
  // For components that need to add a puppy with just a puppy parameter
  const addPuppy = (puppy: Puppy, litterId?: string) => {
    if (!litterId) {
      console.error("Cannot add puppy: Missing litter ID");
      return;
    }
    addPuppyBase(litterId, puppy);
  };
  
  // For components that need to update a puppy with just a puppy parameter
  const updatePuppy = (puppy: Puppy, litterId?: string) => {
    if (!litterId) {
      console.error("Cannot update puppy: Missing litter ID");
      return;
    }
    updatePuppyBase(litterId, puppy);
  };
  
  // Return the combined API that matches the original hook
  return {
    activeLitters,
    archivedLitters,
    isLoading,
    isError,
    refetch,
    
    // Mutations
    addLitter,
    updateLitter,
    deleteLitter,
    archiveLitter,
    
    // Puppy mutations with compatible API
    addPuppy,
    updatePuppy,
    deletePuppy,
    
    // Helper functions
    getAvailableYears
  };
}

// Re-export for direct imports
export * from './queryKeys';
export * from './useLitterQueries';
export * from './useLitterMutations';
export * from './usePuppyMutations';
