
import { Litter } from '@/types/breeding';

export function useLitterUtils(activeLitters, archivedLitters) {
  // Get available years for filtering
  function getAvailableYears() {
    const yearsSet = new Set<number>();
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  }

  // Find the currently selected litter
  const findSelectedLitter = (litterId: string | null): Litter | null => {
    if (!litterId) return null;
    
    return [...activeLitters, ...archivedLitters].find(litter => litter.id === litterId) || null;
  };

  return {
    getAvailableYears,
    findSelectedLitter
  };
}
