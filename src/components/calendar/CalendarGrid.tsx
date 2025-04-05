
import React from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { CalendarEvent } from './types';

interface CalendarGridProps {
  weeks: Date[][];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventColor: (type: string) => string;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  weeks, 
  getEventsForDate,
  getEventColor
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 min-w-[700px]">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center font-medium py-1 text-sm text-primary">
            {day}
          </div>
        ))}
        
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
              
              return (
                <div 
                  key={format(day, 'yyyy-MM-dd')} 
                  className={`min-h-[100px] p-1 border rounded text-sm ${
                    isToday ? 'bg-primary/10 border-primary' : 'bg-white/80 border-cream-300'
                  }`}
                >
                  <div className="font-medium text-right mb-1 text-primary">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div 
                        key={event.id}
                        className={`p-1 rounded text-xs border ${getEventColor(event.type)}`}
                      >
                        <div className="font-medium">{event.title}</div>
                        {event.time && <div className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3 inline" /> {event.time}
                        </div>}
                        {event.dogName && <div>{event.dogName}</div>}
                        {event.notes && <div className="text-xs italic mt-1 truncate">{event.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
