
import { useCallback, useEffect, useState } from 'react';
import { Dog } from '@/types/dogs';
import { parseISO, addDays, isAfter } from 'date-fns';
import { HeatService } from '@/services/HeatService';

/**
 * Hook to calculate the next expected heat date for a female dog
 * Uses unified heat data from both heat_cycles and heatHistory
 */
export const useNextHeatDate = () => {
  /**
   * Calculate the next expected heat date using legacy heat history
   * @param dog The female dog
   * @returns The next expected heat date or null if it can't be calculated
   */
  const calculateNextHeatDateLegacy = useCallback((dog: Dog | null): Date | null => {
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

  /**
   * Calculate the next expected heat date using unified data
   * @param dogId The dog's ID
   * @param heatInterval The dog's heat interval (defaults to 180 days)
   * @returns The next expected heat date or null if it can't be calculated
   */
  const calculateNextHeatDateUnified = useCallback(async (dogId: string, heatInterval?: number): Promise<Date | null> => {
    try {
      const latestDate = await HeatService.getLatestHeatDate(dogId);
      if (!latestDate) return null;

      const today = new Date();
      const intervalDays = heatInterval || 180;
      
      // Calculate next heat cycle
      let nextHeatDate = addDays(latestDate, intervalDays);
      
      // If the next heat date is in the past, calculate the next one after today
      while (!isAfter(nextHeatDate, today)) {
        nextHeatDate = addDays(nextHeatDate, intervalDays);
      }
      
      return nextHeatDate;
    } catch (error) {
      console.error('Error calculating unified next heat date:', error);
      return null;
    }
  }, []);
  
  return { 
    calculateNextHeatDate: calculateNextHeatDateLegacy,
    calculateNextHeatDateUnified 
  };
};
