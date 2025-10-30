import React from 'react';
import { CalendarEvent } from './types';
import { getEventIcon } from '@/utils/eventIconUtils';

interface EventCardProps {
  event: CalendarEvent;
  colorClass: string;
  onClick: () => void;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, colorClass, onClick, compact = false }) => {
  const IconComponent = getEventIcon(event.type);
  
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
      <div className="flex items-center gap-1">
        <IconComponent 
          className={`flex-shrink-0 ${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} 
          strokeWidth={2.5}
        />
        <div className="font-medium truncate flex-1">
          {event.title}
        </div>
      </div>
      {event.dogName && !compact && (
        <div className="text-[8px] font-semibold truncate opacity-90 ml-4">
          {event.dogName}
        </div>
      )}
    </div>
  );
};

export default EventCard;
