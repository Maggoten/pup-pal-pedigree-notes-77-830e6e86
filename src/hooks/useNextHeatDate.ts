
import { useCallback } from 'react';
import { Dog } from '@/types/dogs';
import { parseISO, addDays, isAfter } from 'date-fns';

/**
 * Hook to calculate the next expected heat date for a female dog
 */
export const useNextHeatDate = () => {
  /**
   * Calculate the next expected heat date for a female dog
   * @param dog The female dog
   * @returns The next expected heat date or null if it can't be calculated
   */
  const calculateNextHeatDate = useCallback((dog: Dog | null): Date | null => {
    if (!dog || dog.gender !== 'female' || !dog.heatHistory?.length) {
      return null;
    }
    
    const today = new Date();
    
    // Sort heat dates (newest first)
    const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get the most recent heat date
    const lastHeatDate = parseISO(sortedHeatDates[0].date);
    
    // Use the dog's heat interval if available, otherwise default to 180 days (6 months)
    const intervalDays = dog.heatInterval || 180;
    
    // Calculate next heat cycle
    let nextHeatDate = addDays(lastHeatDate, intervalDays);
    
    // If the next heat date is in the past, calculate the next one after today
    while (!isAfter(nextHeatDate, today)) {
      nextHeatDate = addDays(nextHeatDate, intervalDays);
    }
    
    return nextHeatDate;
  }, []);
  
  return { calculateNextHeatDate };
};
