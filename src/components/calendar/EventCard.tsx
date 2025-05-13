
import React from 'react';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/calendar';
import { BellRing, Calendar } from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  colorClass: string;
  onClick: () => void;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, colorClass, onClick, compact = false }) => {
  // Check if this is a reminder event
  const isReminder = event.id.startsWith('reminder-');
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-1.5 py-1 rounded text-xs transition-colors",
        colorClass,
        "hover:opacity-80"
      )}
    >
      <div className="flex items-center">
        {isReminder && (
          <BellRing className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
        )}
        {!isReminder && (
          <Calendar className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
        )}
        <span className="truncate">
          {event.title}
        </span>
      </div>
    </button>
  );
};

export default EventCard;
