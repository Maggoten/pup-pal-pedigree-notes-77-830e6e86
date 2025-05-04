
import { Dog } from "@/types/dogs";
import { addDays, format, isValid, parse, parseISO } from "date-fns";
import { parseISODate, isValidDate } from "@/utils/dateUtils";

export interface UpcomingHeat {
  dogId: string;
  dogName: string;
  date: Date;
}

/**
 * Parses a date string in different formats and returns a valid Date object or null
 */
const safelyParseDate = (dateStr: string | Date): Date | null => {
  console.log(`[Heat Calculator] Attempting to parse date: ${dateStr}`);
  
  // If it's already a Date object, just check if it's valid
  if (dateStr instanceof Date) {
    if (isValid(dateStr)) {
      console.log(`[Heat Calculator] Date is already a Date object: ${dateStr.toISOString()}`);
      return dateStr;
    }
    console.warn(`[Heat Calculator] Invalid Date object provided`);
    return null;
  }
  
  // If it's a string, try different parsing approaches
  try {
    // Try our custom parser first
    const parsedDate = parseISODate(dateStr);
    if (parsedDate && isValidDate(parsedDate)) {
      console.log(`[Heat Calculator] Successfully parsed date with parseISODate: ${parsedDate.toISOString()}`);
      return parsedDate;
    }
    
    // Try parseISO for ISO format strings
    const isoParsed = parseISO(dateStr);
    if (isValid(isoParsed)) {
      console.log(`[Heat Calculator] Successfully parsed date with parseISO: ${isoParsed.toISOString()}`);
      return isoParsed;
    }
    
    // Try parse with date-fns as a fallback for different formats
    let formatPatterns = ["yyyy-MM-dd", "M/d/yyyy", "MM/dd/yyyy", "dd/MM/yyyy"];
    for (let pattern of formatPatterns) {
      const dateFnsParsed = parse(dateStr, pattern, new Date());
      if (isValid(dateFnsParsed)) {
        console.log(`[Heat Calculator] Successfully parsed date with format ${pattern}: ${dateFnsParsed.toISOString()}`);
        return dateFnsParsed;
      }
    }
    
    // Last resort: native Date parsing
    const nativeParsed = new Date(dateStr);
    if (isValid(nativeParsed)) {
      console.log(`[Heat Calculator] Successfully parsed date with native Date: ${nativeParsed.toISOString()}`);
      return nativeParsed;
    }
    
    console.warn(`[Heat Calculator] Failed to parse date: ${dateStr}`);
    return null;
  } catch (err) {
    console.error(`[Heat Calculator] Error parsing date: ${dateStr}`, err);
    return null;
  }
};

/**
 * Calculate upcoming heat cycles based on dog data
 * @param dogs Array of dogs to process
 * @param monthsAhead Number of months ahead to calculate heats for (default: 3)
 * @param monthsPast Number of months in the past to include (default: 0)
 * @returns Array of upcoming heat dates
 */
export const calculateUpcomingHeats = (
  dogs: Dog[], 
  monthsAhead: number = 3,
  monthsPast: number = 0
): UpcomingHeat[] => {
  const upcomingHeats: UpcomingHeat[] = [];
  const today = new Date();
  const cutoffFuture = addDays(today, monthsAhead * 30); // Approximate months to days
  const cutoffPast = addDays(today, -monthsPast * 30); // Negative days for past
  
  console.log(`[Heat Calculator] Calculating heats with ${dogs.length} dogs, cutoff dates: Past=${format(cutoffPast, 'yyyy-MM-dd')}, Future=${format(cutoffFuture, 'yyyy-MM-dd')}`);
  
  // Process only female dogs
  const femaleDogs = dogs.filter(dog => dog.gender === "female");
  console.log(`[Heat Calculator] Found ${femaleDogs.length} female dogs`);
  
  femaleDogs.forEach(dog => {
    console.log(`[Heat Calculator] Processing dog: ${dog.name}`);
    
    // Skip if no heat history is available
    if (!dog.heatHistory || dog.heatHistory.length === 0) {
      console.log(`[Heat Calculator] No heat history for dog: ${dog.name}`);
      return;
    }
    
    // Use custom interval if available, otherwise default to 6 months (180 days)
    const heatInterval = dog.heatInterval || 180;
    console.log(`[Heat Calculator] Using heat interval of ${heatInterval} days for ${dog.name}`);
    
    try {
      // Get the most recent heat date
      const sortedHeatDates = [...dog.heatHistory].sort((a, b) => {
        const dateA = safelyParseDate(a.date);
        const dateB = safelyParseDate(b.date);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      });
      
      if (sortedHeatDates.length === 0) {
        console.log(`[Heat Calculator] No valid heat dates found for ${dog.name}`);
        return;
      }
      
      const lastHeatRaw = sortedHeatDates[0].date;
      const lastHeatDate = safelyParseDate(lastHeatRaw);
      
      if (!lastHeatDate) {
        console.error(`[Heat Calculator] Failed to parse last heat date for ${dog.name}: ${lastHeatRaw}`);
        return;
      }
      
      console.log(`[Heat Calculator] Last heat date for ${dog.name}: ${format(lastHeatDate, 'yyyy-MM-dd')}`);
      
      // Calculate the next heat date
      let nextHeatDate = addDays(lastHeatDate, heatInterval);
      console.log(`[Heat Calculator] First calculated next heat for ${dog.name}: ${format(nextHeatDate, 'yyyy-MM-dd')}`);
      
      // Generate heat cycles until we're beyond our future cutoff
      while (nextHeatDate <= cutoffFuture) {
        // Only add heat dates that are after our past cutoff
        if (nextHeatDate >= cutoffPast) {
          upcomingHeats.push({
            dogId: dog.id,
            dogName: dog.name,
            date: nextHeatDate
          });
          
          console.log(`[Heat Calculator] Added heat cycle for ${dog.name} on ${format(nextHeatDate, 'yyyy-MM-dd')}`);
        }
        
        // Calculate the next cycle
        nextHeatDate = addDays(nextHeatDate, heatInterval);
      }
    } catch (error) {
      console.error(`[Heat Calculator] Error calculating heats for ${dog.name}:`, error);
    }
  });
  
  // Sort heats by date
  upcomingHeats.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log(`[Heat Calculator] Generated ${upcomingHeats.length} total heat cycles:`);
  upcomingHeats.forEach((heat, i) => {
    if (i < 10) { // Only log the first 10 to avoid cluttering the console
      console.log(`- ${heat.dogName}: ${format(heat.date, 'yyyy-MM-dd')}`);
    }
  });
  
  return upcomingHeats;
};
