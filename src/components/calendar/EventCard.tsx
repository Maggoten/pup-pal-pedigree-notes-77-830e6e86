
import React from 'react';
import { CalendarEvent } from './types';

interface EventCardProps {
  event: CalendarEvent;
  colorClass: string;
  onClick: () => void;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, colorClass, onClick, compact = false }) => {
  return (
    <div
      className={`
        px-1.5 py-1 rounded-lg border text-left cursor-pointer
        transition-all duration-200 hover:opacity-90 hover:shadow-sm
        ${colorClass}
        ${compact ? 'text-[9px] leading-tight' : 'text-[10px]'}
      `}
      onClick={onClick}
    >
      <div className="font-medium truncate">
        {event.title}
      </div>
      {event.dogName && !compact && (
        <div className="text-[8px] font-semibold truncate opacity-90">
          {event.dogName}
        </div>
      )}
    </div>
  );
};

export default EventCard;
