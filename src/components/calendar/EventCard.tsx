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
        {IconComponent && (
          <IconComponent 
            className={`shrink-0 ${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
            strokeWidth={2.5}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {event.title}
          </div>
          {event.dogName && !compact && (
            <div className="text-[8px] font-semibold truncate opacity-90">
              {event.dogName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
