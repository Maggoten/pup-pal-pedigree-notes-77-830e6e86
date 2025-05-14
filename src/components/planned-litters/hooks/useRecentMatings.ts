
import { useMemo } from 'react';
import { PlannedLitter, MatingDate } from '@/types/breeding';
import { format, isToday, parseISO, isBefore, subDays } from 'date-fns';

// Helper function to convert a MatingDate to a standard Date object
const getMatingDateAsDate = (matingDate: Date | MatingDate | string): Date => {
  if (typeof matingDate === 'string') {
    return parseISO(matingDate);
  } else if (matingDate instanceof Date) {
    return matingDate;
  } else {
    // Convert MatingDate object to Date
    const dateValue = matingDate.matingDate;
    return typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  }
};

export const useRecentMatings = (plannedLitters: PlannedLitter[], days = 14) => {
  const recentMatings = useMemo(() => {
    if (!plannedLitters || plannedLitters.length === 0) return [];

    const result: Array<{
      id: string;
      femaleName: string;
      maleName: string;
      matingDate: Date;
      formattedDate: string;
      isToday: boolean;
    }> = [];

    const cutoffDate = subDays(new Date(), days);

    plannedLitters.forEach(litter => {
      if (litter.matingDates && litter.matingDates.length > 0) {
        litter.matingDates.forEach(matingDate => {
          const dateObj = getMatingDateAsDate(matingDate);
          
          if (isBefore(cutoffDate, dateObj) || isToday(dateObj)) {
            result.push({
              id: typeof matingDate === 'object' && 'id' in matingDate ? matingDate.id : `${litter.id}-${dateObj.getTime()}`,
              femaleName: litter.femaleName,
              maleName: litter.externalMale ? litter.externalMaleName || 'External' : litter.maleName,
              matingDate: dateObj,
              formattedDate: format(dateObj, 'MMM d, yyyy'),
              isToday: isToday(dateObj)
            });
          }
        });
      }
    });

    // Sort by date, most recent first
    return result.sort((a, b) => b.matingDate.getTime() - a.matingDate.getTime());
  }, [plannedLitters, days]);

  return recentMatings;
};
