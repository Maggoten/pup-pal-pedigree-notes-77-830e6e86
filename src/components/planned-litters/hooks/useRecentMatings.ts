
import { useState, useEffect } from 'react';
import { parseISO, isBefore } from 'date-fns';
import { PlannedLitter, MatingDate } from '@/types/breeding';
import { RecentMating } from '@/types/reminders';

export const useRecentMatings = (plannedLitters: PlannedLitter[]) => {
  const [recentMatings, setRecentMatings] = useState<RecentMating[]>([]);

  useEffect(() => {
    const matings: RecentMating[] = [];
    
    plannedLitters.forEach(litter => {
      if (litter.matingDates && litter.matingDates.length > 0) {
        litter.matingDates.forEach(matingDateObj => {
          // Extract the date string or convert to string if it's a Date object
          const dateValue = typeof matingDateObj === 'string' ? 
            matingDateObj : 
            typeof matingDateObj.matingDate === 'string' ? 
              matingDateObj.matingDate : 
              matingDateObj.matingDate.toISOString();
          
          const matingDate = parseISO(dateValue);
          
          if (isBefore(matingDate, new Date())) {
            matings.push({
              litterId: litter.id,
              maleName: litter.maleName || 'Unknown',
              femaleName: litter.femaleName,
              date: matingDate
            });
          }
        });
      }
    });
    
    matings.sort((a, b) => b.date.getTime() - a.date.getTime());
    setRecentMatings(matings);
  }, [plannedLitters]);

  return { recentMatings, setRecentMatings };
};
