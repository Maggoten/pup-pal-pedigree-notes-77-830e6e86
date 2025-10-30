import { useMemo } from 'react';
import { format, isSameDay, differenceInDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarEvent } from './types';
import { 
  calculateProgress, 
  formatDayLabel,
  normalizeDate 
} from '@/utils/pregnancyCalculations';
import { getDogPregnancyColor } from '@/utils/dogColorUtils';

interface PregnancyBandProps {
  pregnancy: CalendarEvent;
  weekStart: Date;
  weekEnd: Date;
  rowIndex: number;
  bandIndex: number;
  onClick: (pregnancy: CalendarEvent) => void;
}

export const PregnancyBand = ({
  pregnancy,
  weekStart,
  weekEnd,
  rowIndex,
  bandIndex,
  onClick,
}: PregnancyBandProps) => {
  const isMobile = useIsMobile();
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
  
  // Progress based on ENTIRE period, not segment
  const progressPercent = calculateProgress(
    normalizeDate(pregnancy.startDate),
    new Date()
  );
  
  const dayLabel = formatDayLabel(normalizeDate(pregnancy.startDate));
  
  // Band height: mobile 6-8px, desktop 10-12px
  const bandHeight = isMobile ? '7px' : '10px';
  
  // Minimum click height on mobile: 24px (invisible click area)
  const clickHeight = isMobile ? '24px' : '12px';
  
  // Tooltip content
  const dueDate = format(normalizeDate(pregnancy.endDate), 'd MMM');
  const tooltipText = `${pregnancy.dogName} • ${dayLabel} • Due ${dueDate} (±2d)`;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              relative cursor-pointer transition-all
              ${color.band} ${color.border}
              border-b-2
              ${showLeftCap ? 'rounded-l-full' : ''}
              ${showRightCap ? 'rounded-r-full' : ''}
              hover:brightness-110
            `}
            style={{
              gridColumn: `${startColumn} / ${endColumn}`,
              gridRow: rowIndex + 1,
              height: bandHeight,
              minHeight: clickHeight,
              marginTop: `${24 + (bandIndex * 14)}px`, // 24px under date + 4px gap between bands
              zIndex: 10 + bandIndex,
              pointerEvents: 'auto',
            }}
            onClick={() => onClick(pregnancy)}
            aria-label={tooltipText}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(pregnancy);
              }
            }}
          >
            {/* Progress fill - based on entire period */}
            <div
              className="absolute inset-0 bg-white/30 transition-all"
              style={{
                width: `${progressPercent}%`,
                borderRadius: 'inherit',
              }}
            />
            
            {/* Day label - desktop only, show on hover */}
            {!isMobile && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className={`text-[9px] font-semibold ${color.text} drop-shadow`}>
                  {dayLabel}
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        
        {!isMobile && (
          <TooltipContent>
            <p className="font-semibold">{pregnancy.dogName}</p>
            <p className="text-xs">{dayLabel} • Due {dueDate} (±2d)</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
