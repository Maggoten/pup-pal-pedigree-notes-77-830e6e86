import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatHistoryEntry = { date: string };
type HeatHistoryArray = HeatHistoryEntry[];

/**
 * Batch operations for heat data to improve performance
 */
export class HeatBatchService {
  /**
   * Get unified heat data for multiple dogs in a single batch operation
   * @param dogIds Array of dog IDs to fetch heat data for
   * @returns Map of dogId to their unified heat data
   */
  static async getBatchHeatData(dogIds: string[]): Promise<Map<string, {
    heatCycles: HeatCycle[];
    heatHistory: HeatHistoryEntry[];
    latestDate: Date | null;
  }>> {
    if (dogIds.length === 0) {
      return new Map();
    }

    try {
      // Fetch all heat cycles for the given dogs in one query
      const { data: allHeatCycles } = await supabase
        .from('heat_cycles')
        .select('*')
        .in('dog_id', dogIds);

      // Fetch all dogs' heat histories in one query
      const { data: allDogs } = await supabase
        .from('dogs')
        .select('id, heatHistory')
        .in('id', dogIds);

      const result = new Map();

      // Process each dog's data
      for (const dogId of dogIds) {
        const heatCycles = allHeatCycles?.filter(cycle => cycle.dog_id === dogId) || [];
        const dog = allDogs?.find(d => d.id === dogId);
        const heatHistory = Array.isArray(dog?.heatHistory) ? (dog.heatHistory as HeatHistoryArray) : [];

        // Calculate latest date
        const dates: Date[] = [];
        
        // Add heat cycle dates
        heatCycles.forEach(cycle => {
          dates.push(new Date(cycle.start_date));
        });

        // Add heat history dates
        heatHistory.forEach(entry => {
          dates.push(new Date(entry.date));
        });

        const latestDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

        result.set(dogId, {
          heatCycles,
          heatHistory,
          latestDate
        });
      }

      return result;
    } catch (error) {
      console.error('Error in batch heat data fetch:', error);
      return new Map();
    }
  }

  /**
   * Get latest heat dates for multiple dogs in batch
   * @param dogIds Array of dog IDs
   * @returns Map of dogId to their latest heat date
   */
  static async getBatchLatestHeatDates(dogIds: string[]): Promise<Map<string, Date | null>> {
    const batchData = await this.getBatchHeatData(dogIds);
    const result = new Map<string, Date | null>();

    for (const [dogId, data] of batchData.entries()) {
      result.set(dogId, data.latestDate);
    }

    return result;
  }
}