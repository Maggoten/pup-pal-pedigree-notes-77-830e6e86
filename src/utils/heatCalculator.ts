
import { Dog, Heat } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { addDays, parseISO, differenceInDays, startOfYear } from 'date-fns';
import { HeatService } from '@/services/HeatService';
import { HeatBatchService } from '@/services/HeatService.batch';
import { calculateOptimalHeatInterval } from '@/utils/heatIntervalCalculator';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface NextHeatResult {
  nextHeatDate: Date | null;
  daysUntilNextHeat: number | null;
  intervalDays: number;
  intervalSource: 'calculated' | 'standard';
  lastHeatDate: Date | null;
  totalHeatDates: number;
}

/**
 * Deduplicate heat dates by normalizing to YYYY-MM-DD format
 */
const deduplicateHeatDates = (heatCycles: HeatCycle[], heatHistory: Heat[]): Date[] => {
  const normalizedDates = new Set<string>();
  
  // Helper function to normalize dates to YYYY-MM-DD format
  const normalizeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };
  
  // Add heat cycle start dates
  heatCycles.forEach(cycle => {
    if (cycle.start_date) {
      const normalized = normalizeDate(cycle.start_date);
      normalizedDates.add(normalized);
    }
  });
  
  // Add legacy heat history dates (only if not already present)
  heatHistory.forEach(heat => {
    if (heat.date) {
      const normalized = normalizeDate(heat.date);
      if (!normalizedDates.has(normalized)) {
        normalizedDates.add(normalized);
      }
    }
  });
  
  const uniqueDates = Array.from(normalizedDates)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(dateStr => new Date(dateStr));
  
  return uniqueDates;
};

/**
 * Central function to calculate next heat date with unified logic
 */
export const calculateNextHeatDate = (
  heatCycles: HeatCycle[] = [],
  heatHistory: Heat[] = [],
  dogId?: string
): NextHeatResult => {
  // Deduplicate heat dates from both sources
  const allHeatDates = deduplicateHeatDates(heatCycles, heatHistory);
  
  console.log(`Found ${heatCycles.length + heatHistory.length} total heat dates, ${allHeatDates.length} unique dates for dog ${dogId || 'unknown'}`);
  
  // Use intelligent interval calculation
  const intervalDays = calculateOptimalHeatInterval(allHeatDates);
  const intervalSource = allHeatDates.length >= 2 ? 'calculated' : 'standard';
  
  let nextHeatDate: Date | null = null;
  let daysUntilNextHeat: number | null = null;
  let lastHeatDate: Date | null = null;
  
  if (allHeatDates.length > 0) {
    // Get the most recent heat date
    lastHeatDate = allHeatDates[allHeatDates.length - 1];
    
    // Calculate next heat date by adding interval
    nextHeatDate = addDays(lastHeatDate, intervalDays);
    
    // Handle overdue heats - recalculate to next future cycle
    const today = new Date();
    if (nextHeatDate <= today) {
      const daysPassed = differenceInDays(today, nextHeatDate);
      const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
      nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
    }
    
    daysUntilNextHeat = differenceInDays(nextHeatDate, today);
  }
  
  return {
    nextHeatDate,
    daysUntilNextHeat,
    intervalDays,
    intervalSource,
    lastHeatDate,
    totalHeatDates: allHeatDates.length
  };
};

/**
 * Calculate upcoming heats based on dogs' heat histories (legacy version)
 */
export const calculateUpcomingHeats = (dogs: Dog[]): UpcomingHeat[] => {
  const upcomingHeats: UpcomingHeat[] = [];
  const today = new Date();
  const yearStart = startOfYear(today);
  
  // Filter for female dogs with heat history
  const femaleDogs = dogs.filter(dog => 
    dog.gender === 'female' && 
    dog.heatHistory && 
    dog.heatHistory.length > 0
  );
  
  femaleDogs.forEach(dog => {
    // Sort heat history by date (most recent first)
    const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sortedHeatDates.length > 0) {
      const lastHeatDate = parseISO(sortedHeatDates[0].date);
      // Calculate optimal interval from heat history, default to 365 days (1 year)
      const heatDates = dog.heatHistory?.map(h => parseISO(h.date)) || [];
      const intervalDays = calculateOptimalHeatInterval(heatDates);
      let nextHeatDate = addDays(lastHeatDate, intervalDays);
      
      // Handle overdue heats - recalculate to next future cycle
      if (nextHeatDate <= today) {
        const daysPassed = Math.ceil((today.getTime() - nextHeatDate.getTime()) / (1000 * 60 * 60 * 24));
        const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
        nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
      }
      
      // Now we always include since we've ensured the date is in the future
      if (nextHeatDate >= yearStart) {
        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          dogImageUrl: dog.image,
          date: nextHeatDate,
          lastHeatDate: lastHeatDate,
          source: 'predicted' as const,
          heatIndex: dog.heatHistory.findIndex(h => h.date === sortedHeatDates[0].date) // Store the index for deletion
        });
      }
    }
  });
  
  // Sort by date (closest first)
  return upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Calculate upcoming heats using unified data from both systems (optimized)
 * Uses batch fetching for better performance
 */
export const calculateUpcomingHeatsUnified = async (dogs: Dog[]): Promise<UpcomingHeat[]> => {
  const upcomingHeats: UpcomingHeat[] = [];
  const today = new Date();
  const yearStart = startOfYear(today);
  
  // Filter for female dogs
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  
  if (femaleDogs.length === 0) {
    return [];
  }

  try {
    console.log(`Processing ${femaleDogs.length} female dogs using batch fetch...`);
    
    // Use batch service for optimal performance
    const batchData = await HeatBatchService.getBatchHeatData(femaleDogs.map(dog => dog.id));
    
    for (const dog of femaleDogs) {
      try {
        const data = batchData.get(dog.id);
        if (!data) {
          console.log(`No batch data found for ${dog.name}, trying legacy method...`);
          
          // Try legacy fallback for dogs with old heat history
          if (dog.heatHistory && dog.heatHistory.length > 0) {
            const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            const lastHeatDate = parseISO(sortedHeatDates[0].date);
            const heatDatesForLegacy = dog.heatHistory?.map(h => parseISO(h.date)) || [];
            const intervalDays = calculateOptimalHeatInterval(heatDatesForLegacy);
            let nextHeatDate = addDays(lastHeatDate, intervalDays);
            
            // Handle overdue heats
            if (nextHeatDate <= today) {
              const daysPassed = Math.ceil((today.getTime() - nextHeatDate.getTime()) / (1000 * 60 * 60 * 24));
              const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
              nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
            }
            
            if (nextHeatDate >= yearStart) {
              upcomingHeats.push({
                dogId: dog.id,
                dogName: dog.name,
                dogImageUrl: dog.image,
                date: nextHeatDate,
                lastHeatDate: lastHeatDate,
                source: 'predicted' as const,
                heatIndex: dog.heatHistory.findIndex(h => h.date === sortedHeatDates[0].date)
              });
            }
          }
          continue;
        }

        const { heatCycles, heatHistory } = data;

        // Use the central calculation function
        const heatResult = calculateNextHeatDate(heatCycles, heatHistory, dog.id);

        // Skip dogs with no heat dates
        if (!heatResult.nextHeatDate || heatResult.nextHeatDate < yearStart) {
          continue;
        }

        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          dogImageUrl: dog.image,
          date: heatResult.nextHeatDate,
          lastHeatDate: heatResult.lastHeatDate,
          source: 'predicted' as const,
          heatIndex: -1 // Not used in unified system
        });
      } catch (dogError) {
        console.error(`Error processing dog ${dog.name}:`, dogError);
      }
    }
    
    console.log(`Successfully calculated ${upcomingHeats.length} upcoming heats using batch method`);
  } catch (batchError) {
    console.error('Batch processing failed, falling back to individual calls:', batchError);
    
    // Fallback to individual calls if batch fails
    for (const dog of femaleDogs) {
      try {
        const latestDate = await HeatService.getLatestHeatDate(dog.id);
        
        if (!latestDate) {
          // Try legacy method for dogs with old heat history
          if (dog.heatHistory && dog.heatHistory.length > 0) {
            const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            const lastHeatDate = parseISO(sortedHeatDates[0].date);
            const heatDatesForLegacy = dog.heatHistory?.map(h => parseISO(h.date)) || [];
            const intervalDays = calculateOptimalHeatInterval(heatDatesForLegacy);
            let nextHeatDate = addDays(lastHeatDate, intervalDays);
            
            // Handle overdue heats
            if (nextHeatDate <= today) {
              const daysPassed = Math.ceil((today.getTime() - nextHeatDate.getTime()) / (1000 * 60 * 60 * 24));
              const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
              nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
            }
            
            if (nextHeatDate >= yearStart) {
              upcomingHeats.push({
                dogId: dog.id,
                dogName: dog.name,
                dogImageUrl: dog.image,
                date: nextHeatDate,
                lastHeatDate: lastHeatDate,
                source: 'predicted' as const,
                heatIndex: dog.heatHistory.findIndex(h => h.date === sortedHeatDates[0].date)
              });
            }
          }
          continue;
        }

        // Get unified heat data to calculate intelligent interval
        const unifiedData = await HeatService.getUnifiedHeatData(dog.id);
        
        // Use the central calculation function
        const heatResult = calculateNextHeatDate(
          unifiedData.heatCycles,
          unifiedData.heatHistory,
          dog.id
        );

        // Skip dogs with no heat dates
        if (!heatResult.nextHeatDate || heatResult.nextHeatDate < yearStart) {
          continue;
        }

        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          dogImageUrl: dog.image,
          date: heatResult.nextHeatDate,
          lastHeatDate: heatResult.lastHeatDate,
          source: 'predicted' as const,
          heatIndex: -1 // Not used in unified system
        });
      } catch (dogError) {
        console.error(`Error processing dog ${dog.name} in fallback:`, dogError);
      }
    }
  }
  
  // Sort by date (closest first)
  return upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
};
