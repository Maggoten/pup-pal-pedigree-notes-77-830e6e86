import { useMemo } from 'react';
import { isSameDay, differenceInDays } from 'date-fns';
import { CalendarEvent } from './types';
import { 
  normalizeDate,
  isInDueWeek,
  addDays
} from '@/utils/pregnancyCalculations';
import { getDogPregnancyColor } from '@/utils/dogColorUtils';

interface PregnancyBandProps {
  pregnancy: CalendarEvent;
  weekStart: Date;
  weekEnd: Date;
  rowIndex: number;
  bandIndex: number;
}

export const PregnancyBand = ({
  pregnancy,
  weekStart,
  weekEnd,
  rowIndex,
  bandIndex,
}: PregnancyBandProps) => {
  const color = getDogPregnancyColor(pregnancy.dogId || '');
  
  // Segmentation: clamp to current week
  const segmentStart = useMemo(() => {
    const pregnancyStart = normalizeDate(pregnancy.startDate);
    const weekStartNorm = normalizeDate(weekStart);
    return pregnancyStart > weekStartNorm ? pregnancyStart : weekStartNorm;
  }, [pregnancy.startDate, weekStart]);
  
  const segmentEnd = useMemo(() => {
    const pregnancyEnd = normalizeDate(pregnancy.endDate);
    const weekEndNorm = normalizeDate(weekEnd);
    return pregnancyEnd < weekEndNorm ? pregnancyEnd : weekEndNorm;
  }, [pregnancy.endDate, weekEnd]);
  
  // Calculate grid position
  const startColumn = useMemo(() => {
    const diff = differenceInDays(segmentStart, normalizeDate(weekStart));
    return diff + 1; // Grid columns are 1-indexed
  }, [segmentStart, weekStart]);
  
  const endColumn = useMemo(() => {
    const diff = differenceInDays(segmentEnd, normalizeDate(weekStart));
    return diff + 2; // +2 to include the end day
  }, [segmentEnd, weekStart]);
  
  // Caps: show rounded edges only at start/end of pregnancy period
  const showLeftCap = isSameDay(segmentStart, normalizeDate(pregnancy.startDate));
  const showRightCap = isSameDay(segmentEnd, normalizeDate(pregnancy.endDate));
  
  // Check if any part of this segment is in the due week (D61-D65)
  const isSegmentInDueWeek = useMemo(() => {
    const matingDate = normalizeDate(pregnancy.startDate);
    // Check if any day in the segment is in due week
    const dayCount = differenceInDays(segmentEnd, segmentStart);
    for (let i = 0; i <= dayCount; i++) {
      const checkDate = addDays(segmentStart, i);
      if (isInDueWeek(checkDate, matingDate)) {
        return true;
      }
    }
    return false;
  }, [pregnancy.startDate, segmentStart, segmentEnd]);
  
  // Line styling: 2px normal, 3px in due week
  const lineHeight = isSegmentInDueWeek ? '3px' : '2px';
  const lineOpacity = isSegmentInDueWeek ? 'opacity-25' : 'opacity-[0.15]';
  
  // Render week ticks (every 7 days from mating date)
  const renderWeekTicks = () => {
    const ticks: JSX.Element[] = [];
    const matingDate = normalizeDate(pregnancy.startDate);
    const segmentDays = differenceInDays(segmentEnd, segmentStart) + 1;
    
    for (let i = 0; i < segmentDays; i++) {
      const currentDate = addDays(segmentStart, i);
      const daysSinceMating = differenceInDays(currentDate, matingDate);
      
      // Tick every 7 days (D+7, D+14, D+21, etc.)
      if (daysSinceMating > 0 && daysSinceMating % 7 === 0) {
        const position = (i / segmentDays) * 100;
        ticks.push(
          <div
            key={`tick-${i}`}
            className="absolute w-[1px] h-1 bg-current opacity-20"
            style={{
              left: `${position}%`,
              top: '-2px'
            }}
          />
        );
      }
    }
    
    return ticks;
  };
  
  return (
    <div
      className={`
        relative
        ${color.band} ${lineOpacity}
        ${showLeftCap ? 'rounded-l-sm' : ''}
        ${showRightCap ? 'rounded-r-sm' : ''}
      `}
      style={{
        gridColumn: `${startColumn} / ${endColumn}`,
        gridRow: rowIndex + 1,
        height: lineHeight,
        marginTop: `${26 + (bandIndex * 5)}px`, // 26px from top + 3px gap between lines
        zIndex: 5 + bandIndex,
        pointerEvents: 'none', // Not clickable - entire day cell is clickable
      }}
    >
      {/* Week ticks */}
      {renderWeekTicks()}
    </div>
  );
};
