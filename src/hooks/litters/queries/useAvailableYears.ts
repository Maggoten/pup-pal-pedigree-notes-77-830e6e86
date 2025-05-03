
import { useCallback } from 'react';
import { Litter } from '@/types/breeding';
import { useActiveLittersQuery } from './useActiveLittersQuery';
import { useArchivedLittersQuery } from './useArchivedLittersQuery';

export const useAvailableYears = () => {
  const activeLittersQuery = useActiveLittersQuery();
  const archivedLittersQuery = useArchivedLittersQuery();
  
  return useCallback(() => {
    const yearsSet = new Set<number>();
    
    const activeLitters = activeLittersQuery.data || [];
    const archivedLitters = archivedLittersQuery.data || [];
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  }, [activeLittersQuery.data, archivedLittersQuery.data]);
};
