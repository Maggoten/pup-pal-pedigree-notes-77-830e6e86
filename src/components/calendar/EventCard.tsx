import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { getEventIcon } from '@/utils/eventIconUtils';
import { Trash2 } from 'lucide-react';
import { EventDeletionHelpers } from '@/config/eventDeletionConfig';

interface EventCardProps {
  event: CalendarEvent;
  colorClass: string;
  onClick: () => void;
  onDelete?: (eventId: string) => void;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  colorClass, 
  onClick, 
  onDelete,
  compact = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = getEventIcon(event.type);
  const canDelete = EventDeletionHelpers.canDelete(event.type || 'custom');
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete(event.id);
    }
  };
  
  return (
    <div
      className={`
        relative px-1.5 py-1 rounded-lg border text-left cursor-pointer
        transition-all duration-200 hover:opacity-90 hover:shadow-sm
        ${colorClass}
        ${compact ? 'text-[9px] leading-tight' : 'text-[10px]'}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1">
        <IconComponent 
          className={`flex-shrink-0 ${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} 
          strokeWidth={2.5}
        />
        <div className="font-medium truncate flex-1">
          {event.title}
        </div>
        
        {/* Delete button (desktop only, on hover) */}
        {!compact && canDelete && onDelete && isHovered && (
          <button
            onClick={handleDeleteClick}
            className="flex-shrink-0 p-0.5 rounded hover:bg-red-100 transition-colors"
            aria-label="Radera händelse"
          >
            <Trash2 className="h-2.5 w-2.5 text-red-600" strokeWidth={2.5} />
          </button>
        )}
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
