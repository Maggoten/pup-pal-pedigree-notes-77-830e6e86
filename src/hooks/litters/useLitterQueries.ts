
import { useQuery } from '@tanstack/react-query';
import { supabaseLitterService } from '@/services/supabase/litterService';
import { Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { litterQueryKeys } from './queryKeys';

export function useLitterQueries() {
  const { user } = useAuth();
  
  // Main query for fetching litter data
  const {
    data: litters = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: litterQueryKeys.lists(),
    queryFn: async () => {
      if (!user) return [];
      
      const litters = await supabaseLitterService.loadLitters();
      // Pre-sort litters here to avoid re-sorting on render
      const sortByDate = (a: Litter, b: Litter) => 
        new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
      
      return litters.sort(sortByDate);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Separate active and archived litters to avoid recalculations
  const activeLitters = litters?.filter(litter => !litter.archived) || [];
  const archivedLitters = litters?.filter(litter => litter.archived) || [];
  
  // Error handling for data fetching
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error loading litters",
        description: error instanceof Error ? error.message : "Failed to load litters data",
        variant: "destructive",
      });
    }
  }, [isError, error]);

  // Helper functions
  const getAvailableYears = () => {
    const yearsSet = new Set<number>();
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  };

  return {
    litters,
    activeLitters,
    archivedLitters,
    isLoading,
    isError,
    refetch,
    getAvailableYears
  };
}
