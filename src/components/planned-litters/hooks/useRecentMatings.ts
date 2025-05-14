
import { useMemo, useState } from 'react';
import { PlannedLitter } from '@/types/breeding';
import { format, isToday } from 'date-fns';
import { MatingData, RecentMating } from '@/types/reminders';
import { isWithinDays } from '@/utils/dateUtils';

export const useRecentMatings = (plannedLitters: PlannedLitter[]) => {
  const [extendedRecentPeriod, setExtendedRecentPeriod] = useState(false);
  
  const recentMatings = useMemo(() => {
    if (!plannedLitters || plannedLitters.length === 0) {
      return [] as MatingData[];
    }
    
    const daysToConsiderRecent = extendedRecentPeriod ? 14 : 7;
    
    const recentData: MatingData[] = [];
    
    plannedLitters.forEach(litter => {
      if (litter.matingDates && litter.matingDates.length > 0) {
        litter.matingDates.forEach(mating => {
          const matingDate = new Date(mating.matingDate);
          
          if (isWithinDays(matingDate, new Date(), daysToConsiderRecent)) {
            recentData.push({
              id: mating.id || `mating-${litter.id}-${recentData.length}`,
              litterId: litter.id,
              femaleName: litter.femaleName,
              maleName: litter.externalMale ? litter.externalMaleName || 'External Male' : litter.maleName || 'Unknown Male',
              matingDate: matingDate,
              formattedDate: format(matingDate, 'MMM d, yyyy'),
              isToday: isToday(matingDate)
            });
          }
        });
      }
    });
    
    // Sort by date with most recent first
    return recentData.sort((a, b) => 
      b.matingDate.getTime() - a.matingDate.getTime()
    );
  }, [plannedLitters, extendedRecentPeriod]);
  
  return { 
    recentMatings, 
    setExtendedRecentPeriod,
    extendedRecentPeriod
  };
};
