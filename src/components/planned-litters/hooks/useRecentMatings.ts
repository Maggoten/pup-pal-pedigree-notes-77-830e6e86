
import { useState, useEffect } from 'react';
import { parseISO, isBefore } from 'date-fns';
import { PlannedLitter } from '@/types/breeding';
import { RecentMating } from '@/types/reminders';

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
              id: `${litter.id}-${matingDate.getTime()}`,
              litterId: litter.id,
              damId: litter.femaleId,
              damName: litter.femaleName || 'Unknown',
              sireId: litter.maleId || undefined,
              sireName: litter.maleName || 'Unknown Male',
              maleName: litter.maleName || 'Unknown Male',
              femaleName: litter.femaleName || 'Unknown Female',
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
