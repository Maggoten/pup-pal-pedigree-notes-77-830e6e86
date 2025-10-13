import { useCallback } from 'react';
import { HeatService } from '@/services/HeatService';
import { calculateNextHeatDate } from '@/utils/heatCalculator';

/**
 * Hook to calculate the next expected heat date for planned litters
 * Uses the unified calculateNextHeatDate function from heatCalculator
 */
export const usePlannedLitterHeatDate = () => {
  /**
   * Calculate the next expected heat date using unified data
   * @param dogId The dog's ID
   * @returns The next expected heat date or null if it can't be calculated
   */
  const calculateHeatDate = useCallback(async (dogId: string): Promise<Date | null> => {
    try {
      // Fetch unified heat data (both heat_cycles and legacy heatHistory)
      const unifiedData = await HeatService.getUnifiedHeatData(dogId);
      
      if (!unifiedData) {
        return null;
      }

      // Use the central calculateNextHeatDate function
      const result = calculateNextHeatDate(
        unifiedData.heatCycles || [],
        unifiedData.heatHistory || [],
        dogId
      );

      return result.nextHeatDate;
    } catch (error) {
      console.error('Error calculating planned litter heat date:', error);
      return null;
    }
  }, []);

  return { calculateHeatDate };
};
