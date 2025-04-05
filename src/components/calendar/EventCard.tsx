
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
        px-1.5 py-0.5 rounded border text-left cursor-pointer
        transition-colors duration-150 hover:opacity-90
        ${colorClass}
        ${compact ? 'text-[9px] leading-tight' : 'text-[10px]'}
      `}
      onClick={onClick}
    >
      {event.title}
      {event.dogName && !compact && (
        <div className="text-[8px] font-semibold truncate">
          {event.dogName}
        </div>
      )}
    </div>
  );
};

export default EventCard;
