import { differenceInDays, addDays } from 'date-fns';
import { Star } from 'lucide-react';
import { CalendarEvent } from './types';
import { normalizeDate, calculateDueDate, isInDueWeek } from '@/utils/pregnancyCalculations';
import { getDogPregnancyColor } from '@/utils/dogColorUtils';

interface PregnancyWeekBadgeProps {
  pregnancy: CalendarEvent;
  weekStart: Date;
  weekEnd: Date;
  onBadgeClick?: () => void;
}

export const PregnancyWeekBadge = ({
  pregnancy,
  weekStart,
  weekEnd,
  onBadgeClick,
}: PregnancyWeekBadgeProps) => {
  const matingDate = normalizeDate(pregnancy.startDate);
  const dueDate = calculateDueDate(matingDate);
  const isDueWeek = isInDueWeek(weekStart, matingDate);
  const color = getDogPregnancyColor(pregnancy.dogId || '');
  
  // Calculate day range for this week
  const startDay = Math.max(0, differenceInDays(weekStart, matingDate));
  const endDay = Math.min(63, differenceInDays(weekEnd, matingDate));
  
  const dogName = pregnancy.dogName || 'Unknown';
  
  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md
        text-[11px] font-medium cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${isDueWeek 
          ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-sm' 
          : 'bg-white/95 border shadow-sm'
        }
      `}
      style={{ 
        color: isDueWeek ? undefined : color.chip,
        borderColor: isDueWeek ? undefined : color.border
      }}
      onClick={(e) => {
        e.stopPropagation();
        onBadgeClick?.();
      }}
    >
      {isDueWeek ? (
        <>
          <Star className="w-3 h-3 fill-rose-600 text-rose-600" />
          <span>Due ±2d</span>
        </>
      ) : (
        <>
          <span className="font-semibold truncate max-w-[80px] sm:max-w-none">{dogName}</span>
          <span className="opacity-70">•</span>
          <span>D+{startDay}–{endDay}</span>
        </>
      )}
    </div>
  );
};
