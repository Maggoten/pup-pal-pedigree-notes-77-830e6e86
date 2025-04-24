
import { useState, useEffect } from 'react';
import { parseISO, isBefore } from 'date-fns';
import { PlannedLitter } from '@/types/breeding';
import { RecentMating } from '../types';

export const useRecentMatings = (plannedLitters: PlannedLitter[]) => {
  const [recentMatings, setRecentMatings] = useState<RecentMating[]>([]);

  useEffect(() => {
    const matings: RecentMating[] = [];
    
    plannedLitters.forEach(litter => {
      if (litter.matingDates && litter.matingDates.length > 0) {
        litter.matingDates.forEach(dateStr => {
          const matingDate = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
          if (isBefore(matingDate, new Date())) {
            matings.push({
              id: `${litter.id}-${dateStr}`,
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
