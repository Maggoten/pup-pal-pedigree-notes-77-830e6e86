import { CalendarEvent } from './types';
import { getEventCategory } from '@/utils/eventCategories';

interface CompactEventPillProps {
  event: CalendarEvent;
  onClick: () => void;
  showIcon?: boolean;
}

export const CompactEventPill = ({ 
  event, 
  onClick,
  showIcon = true 
}: CompactEventPillProps) => {
  const category = getEventCategory(event.type);
  
  return (
    <div
      className={`
        flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
        cursor-pointer transition-all hover:scale-105 hover:shadow-sm
        ${category.pillClass} border max-w-full
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${event.dogName || event.title}${event.time ? ` at ${event.time}` : ''}`}
    >
      {showIcon && <span className="text-[11px] shrink-0">{category.icon}</span>}
      <span className="truncate">
        {event.dogName || event.title}
      </span>
      {event.time && (
        <span className="text-[8px] opacity-70 shrink-0">⏰</span>
      )}
    </div>
  );
};
