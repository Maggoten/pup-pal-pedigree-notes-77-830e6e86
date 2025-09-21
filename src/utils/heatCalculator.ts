
import { Dog } from '@/types/dogs';
import { UpcomingHeat } from '@/types/reminders';
import { addDays, parseISO } from 'date-fns';
import { HeatService } from '@/services/HeatService';
import { calculateOptimalHeatInterval } from '@/utils/heatIntervalCalculator';

/**
 * Calculate upcoming heats based on dogs' heat histories (legacy version)
 */
export const calculateUpcomingHeats = (dogs: Dog[]): UpcomingHeat[] => {
  const upcomingHeats: UpcomingHeat[] = [];
  const today = new Date();
  
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
      if (nextHeatDate > today) {
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
 * Calculate upcoming heats using unified data from both systems
 * This will be the preferred method in Step 5
 */
export const calculateUpcomingHeatsUnified = async (dogs: Dog[]): Promise<UpcomingHeat[]> => {
  const upcomingHeats: UpcomingHeat[] = [];
  const today = new Date();
  
  // Filter for female dogs
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  
  for (const dog of femaleDogs) {
    console.log(`Processing dog ${dog.name} (${dog.id})...`);
    
    try {
      const latestDate = await HeatService.getLatestHeatDate(dog.id);
      
      // If HeatService can't find a latest date, try legacy method immediately
      if (!latestDate) {
        console.log(`No latest date found via HeatService for ${dog.name}, trying legacy method...`);
        
        // Try legacy fallback for dogs with old heat history
        if (dog.heatHistory && dog.heatHistory.length > 0) {
          console.log(`Found ${dog.heatHistory.length} heat records in legacy format for ${dog.name}`);
          
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
          
          if (nextHeatDate > today) {
            console.log(`Successfully calculated upcoming heat for ${dog.name} using legacy method`);
            upcomingHeats.push({
              dogId: dog.id,
              dogName: dog.name,
              dogImageUrl: dog.image,
              date: nextHeatDate,
              lastHeatDate: lastHeatDate,
              source: 'predicted' as const,
              heatIndex: dog.heatHistory.findIndex(h => h.date === sortedHeatDates[0].date)
            });
          } else {
            console.log(`Calculated date for ${dog.name} is not in future, skipping`);
          }
        } else {
          console.log(`No heat history found for ${dog.name}, skipping`);
        }
        continue;
      }

      console.log(`Found latest heat date for ${dog.name}: ${latestDate}`);

      // Get unified heat data to calculate intelligent interval
      const unifiedData = await HeatService.getUnifiedHeatData(dog.id);
      const allHeatDates = [
        ...unifiedData.heatCycles.map(cycle => new Date(cycle.start_date)),
        ...unifiedData.heatHistory.map(h => new Date(h.date))
      ].sort((a, b) => a.getTime() - b.getTime());

      console.log(`Found ${allHeatDates.length} total heat dates for ${dog.name}`);

      // Use intelligent interval calculation: history-based for 2+ heats, 365 days for 0-1 heats
      const intervalDays = calculateOptimalHeatInterval(allHeatDates);
      let nextHeatDate = addDays(latestDate, intervalDays);
      
      // Handle overdue heats in unified calculation
      if (nextHeatDate <= today) {
        const daysPassed = Math.ceil((today.getTime() - nextHeatDate.getTime()) / (1000 * 60 * 60 * 24));
        const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
        nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
      }
      
      // Only include if the next heat date is in the future
      if (nextHeatDate > today) {
        console.log(`Successfully calculated upcoming heat for ${dog.name} using unified method`);
        upcomingHeats.push({
          dogId: dog.id,
          dogName: dog.name,
          dogImageUrl: dog.image,
          date: nextHeatDate,
          lastHeatDate: latestDate,
          source: 'predicted' as const,
          heatIndex: -1 // Not used in unified system
        });
      } else {
        console.log(`Calculated date for ${dog.name} is not in future, skipping`);
      }
    } catch (error) {
      console.error(`Error with unified calculation for dog ${dog.name} (${dog.id}):`, error);
      
      // Fall back to legacy calculation for this dog
      if (dog.heatHistory && dog.heatHistory.length > 0) {
        console.log(`Falling back to legacy method for ${dog.name} due to error`);
        
        const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const lastHeatDate = parseISO(sortedHeatDates[0].date);
        const heatDatesForFallback = dog.heatHistory?.map(h => parseISO(h.date)) || [];
        const intervalDays = calculateOptimalHeatInterval(heatDatesForFallback);
        let nextHeatDate = addDays(lastHeatDate, intervalDays);
        
        // Handle overdue heats in fallback logic too
        if (nextHeatDate <= today) {
          const daysPassed = Math.ceil((today.getTime() - nextHeatDate.getTime()) / (1000 * 60 * 60 * 24));
          const intervalsPassed = Math.floor(daysPassed / intervalDays) + 1;
          nextHeatDate = addDays(nextHeatDate, intervalsPassed * intervalDays);
        }
        
        if (nextHeatDate > today) {
          console.log(`Successfully calculated upcoming heat for ${dog.name} using fallback method`);
          upcomingHeats.push({
            dogId: dog.id,
            dogName: dog.name,
            dogImageUrl: dog.image,
            date: nextHeatDate,
            lastHeatDate: lastHeatDate,
            source: 'predicted' as const,
            heatIndex: dog.heatHistory.findIndex(h => h.date === sortedHeatDates[0].date)
          });
        } else {
          console.log(`Fallback calculated date for ${dog.name} is not in future, skipping`);
        }
      } else {
        console.log(`No fallback heat history available for ${dog.name}, skipping`);
      }
    }
  }
  
  // Sort by date (closest first)
  return upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
};
