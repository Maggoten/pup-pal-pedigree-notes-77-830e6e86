import { differenceInDays } from 'date-fns';

/**
 * Calculate optimal heat interval based on heat history
 * @param heatDates Array of heat dates (most recent first)
 * @returns Heat interval in days (360 if less than 2 dates, otherwise calculated average)
 */
export const calculateOptimalHeatInterval = (heatDates: Date[]): number => {
  // If less than 2 heat dates, use 360 days (12 months) as standard
  if (!heatDates || heatDates.length < 2) {
    return 360;
  }

  // Sort dates to ensure newest first
  const sortedDates = [...heatDates].sort((a, b) => b.getTime() - a.getTime());
  
  // Calculate intervals between consecutive heat dates
  const intervals: number[] = [];
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const daysBetween = differenceInDays(sortedDates[i], sortedDates[i + 1]);
    intervals.push(daysBetween);
  }

  // Return average interval, rounded to nearest day
  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return Math.round(averageInterval);
};

/**
 * Get heat interval description for UI display
 * @param heatDates Array of heat dates
 * @returns Object with interval and source description
 */
export const getHeatIntervalInfo = (heatDates: Date[]) => {
  const interval = calculateOptimalHeatInterval(heatDates);
  const isCalculated = heatDates && heatDates.length >= 2;
  
  return {
    interval,
    source: isCalculated ? 'calculated' as const : 'standard' as const,
    description: isCalculated 
      ? 'Beräknat från tidigare löp' 
      : 'Standardvärde (12 månader)'
  };
};