
import React, { useState } from 'react';
import { format, isSameMonth, isSameDay } from 'date-fns';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import EventCard from './EventCard';
import MobileEventCard from './MobileEventCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarEvent } from './types';

interface CalendarGridProps {
  weeks: Date[][];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventColor: (type: string) => string;
  onDeleteEvent: (eventId: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  compact?: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  weeks, 
  getEventsForDate, 
  getEventColor, 
  onDeleteEvent,
  onEventClick,
  compact = false 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const isMobile = useIsMobile();
  
  const today = new Date();
  const handleEventClick = (event: CalendarEvent) => {
    if (isMobile) {
      setSelectedEvent(event);
    } else {
      onEventClick(event);
    }
  };
  
  const handleCloseEventDetails = () => {
    setSelectedEvent(null);
  };
  
  const handleDeleteEvent = (eventId: string) => {
    onDeleteEvent(eventId);
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-1 text-center font-medium mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-xs py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const isToday = isSameDay(day, today);
              const isCurrentMonth = isSameMonth(day, new Date());
              const events = getEventsForDate(day);
              const maxEvents = compact ? 1 : 3;
              const displayEvents = events.slice(0, maxEvents);
              const hiddenEventsCount = events.length - maxEvents;
              
              return (
                <ContextMenu key={day.toISOString()}>
                  <ContextMenuTrigger>
                    <div 
                      className={`
                        rounded-md border h-full ${compact ? 'min-h-[80px]' : 'min-h-[100px]'}
                        flex flex-col
                        ${isToday 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-white/70 border-neutral-100'
                        }
                        ${!isCurrentMonth ? 'opacity-50' : ''}
                      `}
                    >
                      <div className={`
                        text-xs py-1 px-2 flex justify-between items-center
                        ${isToday ? 'font-bold text-primary' : ''}
                      `}>
                        <span>
                          {format(day, 'd')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(day, 'EEE')}
                        </span>
                      </div>
                      
                      <div className="flex-1 p-1 space-y-1 overflow-y-auto scrollbar-thin">
                        {displayEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            colorClass={getEventColor(event.type)}
                            onClick={() => handleEventClick(event)}
                            compact={compact}
                          />
                        ))}
                        
                        {hiddenEventsCount > 0 && (
                          <div className="text-[10px] text-center p-1 bg-neutral-100 rounded">
                            +{hiddenEventsCount} more
                          </div>
                        )}
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  
                  <ContextMenuContent>
                    {events
                      .filter(event => event.type === 'custom')
                      .map(event => (
                        <ContextMenuItem 
                          key={event.id} 
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDeleteEvent(event.id)}
                        >
                          Delete "{event.title}"
                        </ContextMenuItem>
                      ))}
                    
                    {events.filter(event => event.type === 'custom').length === 0 && (
                      <ContextMenuItem disabled>
                        No custom events to manage
                      </ContextMenuItem>
                    )}
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Mobile event details modal */}
      {isMobile && selectedEvent && (
        <MobileEventCard
          event={selectedEvent}
          colorClass={getEventColor(selectedEvent.type)}
          onClose={handleCloseEventDetails}
          onDelete={selectedEvent.type === 'custom' ? () => handleDeleteEvent(selectedEvent.id) : undefined}
          onEdit={() => {
            onEventClick(selectedEvent);
            handleCloseEventDetails();
          }}
        />
      )}
    </>
  );
};

export default CalendarGrid;
