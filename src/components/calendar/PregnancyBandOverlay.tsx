import { useMemo } from 'react';
import { PregnancyBand } from './PregnancyBand';
import { CalendarEvent } from './types';
import { normalizeDate } from '@/utils/pregnancyCalculations';
import { startOfWeek, endOfWeek } from 'date-fns';

interface PregnancyBandOverlayProps {
  weeks: Date[][];
  getEventsForDate: (date: Date) => CalendarEvent[];
  showUnderlay?: boolean;
}

interface BandWithPosition {
  pregnancy: CalendarEvent;
  rowIndex: number;
  bandIndex: number;
}

export const PregnancyBandOverlay = ({
  weeks,
  getEventsForDate,
  showUnderlay = true,
}: PregnancyBandOverlayProps) => {
  
  // If showUnderlay is false, don't render anything
  if (!showUnderlay) return null;
  
  // Collect all pregnancy-period events and calculate band positions
  const bandsWithPositions = useMemo(() => {
    const bands: BandWithPosition[] = [];
    
    weeks.forEach((week, weekIndex) => {
      const weekStart = startOfWeek(week[0], { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(week[6], { weekStartsOn: 1 }); // Sunday
      
      // Collect all pregnancies that overlap this week
      const pregnanciesInWeek: CalendarEvent[] = [];
      week.forEach(day => {
        const events = getEventsForDate(day);
        events.forEach(event => {
          if (
            event.type === 'pregnancy-period' &&
            !pregnanciesInWeek.find(p => p.id === event.id)
          ) {
            pregnanciesInWeek.push(event);
          }
        });
      });
      
      // Sort by start date
      pregnanciesInWeek.sort((a, b) => {
        const dateA = normalizeDate(a.startDate).getTime();
        const dateB = normalizeDate(b.startDate).getTime();
        return dateA - dateB;
      });
      
      // Collision handling: assign bandIndex per week (max 3 visible)
      const occupiedSlots: boolean[] = []; // Track which band indices are occupied
      
      pregnanciesInWeek.forEach(pregnancy => {
        // Find first available slot (max 3 lines)
        let bandIndex = 0;
        while (occupiedSlots[bandIndex] && bandIndex < 3) {
          bandIndex++;
        }
        
        // Only render if within max 3 lines
        if (bandIndex < 3) {
          occupiedSlots[bandIndex] = true;
          
          bands.push({
            pregnancy,
            rowIndex: weekIndex,
            bandIndex,
          });
        }
      });
    });
    
    return bands;
  }, [weeks, getEventsForDate]);
  
  // Memoize for performance
  const memoizedBands = useMemo(() => {
    return bandsWithPositions.map((band) => {
      const week = weeks[band.rowIndex];
      const weekStart = startOfWeek(week[0], { weekStartsOn: 1 });
      const weekEnd = endOfWeek(week[6], { weekStartsOn: 1 });
      
      return (
        <PregnancyBand
          key={`${band.pregnancy.id}-week-${band.rowIndex}`}
          pregnancy={band.pregnancy}
          weekStart={weekStart}
          weekEnd={weekEnd}
          rowIndex={band.rowIndex}
          bandIndex={band.bandIndex}
        />
      );
    });
  }, [bandsWithPositions, weeks]);
  
  return (
    <div
      className="pregnancy-band-overlay absolute inset-0 pointer-events-none"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridAutoRows: 'minmax(100px, auto)',
        gap: '4px',
        zIndex: 1, // Low z-index - under events but over background
      }}
    >
      {memoizedBands}
    </div>
  );
};
