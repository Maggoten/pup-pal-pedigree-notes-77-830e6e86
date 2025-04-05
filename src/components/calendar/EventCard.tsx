
import React from 'react';
import { Clock } from 'lucide-react';
import { CalendarEvent } from './types';

interface EventCardProps {
  event: CalendarEvent;
  getEventColor: (type: string) => string;
}

const EventCard: React.FC<EventCardProps> = ({ event, getEventColor }) => {
  // Add a visual indicator for custom events that can be deleted
  const isCustomEvent = event.type === 'custom';
  
  return (
    <div 
      className={`p-1 rounded text-xs border ${getEventColor(event.type)} cursor-default ${isCustomEvent ? 'relative group' : ''}`}
    >
      <div className="font-medium">{event.title}</div>
      {event.time && <div className="text-xs flex items-center gap-1">
        <Clock className="h-3 w-3 inline" /> {event.time}
      </div>}
      {event.dogName && <div>{event.dogName}</div>}
      {event.notes && <div className="text-xs italic mt-1 truncate">{event.notes}</div>}
      
      {/* Visual indicator for deletable events */}
      {isCustomEvent && (
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100">
          <div className="bg-white rounded-full p-0.5 shadow-sm -mt-1 -mr-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
