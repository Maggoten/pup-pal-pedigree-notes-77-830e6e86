
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

// Helper function to get consistent color for each dog's pregnancy
const getDogPregnancyColor = (dogId?: string) => {
  const colors = [
    { bg: 'bg-pink-50/90', border: 'border-pink-200/70', shadow: 'shadow-pink-100/20', dot: 'bg-pink-400', text: 'text-pink-700' },
    { bg: 'bg-purple-50/90', border: 'border-purple-200/70', shadow: 'shadow-purple-100/20', dot: 'bg-purple-400', text: 'text-purple-700' },
    { bg: 'bg-blue-50/90', border: 'border-blue-200/70', shadow: 'shadow-blue-100/20', dot: 'bg-blue-400', text: 'text-blue-700' },
    { bg: 'bg-orange-50/90', border: 'border-orange-200/70', shadow: 'shadow-orange-100/20', dot: 'bg-orange-400', text: 'text-orange-700' },
    { bg: 'bg-emerald-50/90', border: 'border-emerald-200/70', shadow: 'shadow-emerald-100/20', dot: 'bg-emerald-400', text: 'text-emerald-700' },
  ];
  
  if (!dogId) return colors[0];
  const hash = dogId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

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
          <div key={day} className="text-xs py-1 text-darkgray-600 font-semibold">
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
              
              // Separate pregnancy events from visible events
              const pregnancyEvents = events.filter(event => event.type === 'pregnancy-period');
              const visibleEvents = events.filter(event => event.type !== 'pregnancy-period');
              const maxEvents = compact ? 1 : 3;
              const displayEvents = visibleEvents.slice(0, maxEvents);
              const hiddenEventsCount = visibleEvents.length - maxEvents;
              
              // Check for special fertility/ovulation/heat/pregnancy events
              const hasOvulation = events.some(event => event.type === 'ovulation-predicted');
              const hasFertility = events.some(event => event.type === 'fertility-window');
              const hasHeat = events.some(event => event.type === 'heat' || event.type === 'heat-active');
              const hasPregnancy = pregnancyEvents.length > 0;
              
              // Get pregnancy colors for this day
              const pregnancyColors = pregnancyEvents.map(e => getDogPregnancyColor(e.dogId));
              const primaryPregnancyColor = pregnancyColors[0] || getDogPregnancyColor('');
              
              return (
                <ContextMenu key={day.toISOString()}>
                  <ContextMenuTrigger>
                    <div 
                      className={`
                        rounded-lg border h-full ${compact ? 'min-h-[80px]' : 'min-h-[100px]'}
                        flex flex-col transition-colors duration-200
                        ${hasOvulation 
                          ? 'bg-purple-100/90 border-purple-300/70 shadow-purple-200/30 shadow-lg' 
                          : hasFertility 
                          ? 'bg-purple-100/90 border-purple-300/70 shadow-purple-200/30 shadow-lg'
                          : hasPregnancy
                          ? `${primaryPregnancyColor.bg} ${primaryPregnancyColor.border} ${primaryPregnancyColor.shadow} shadow-sm`
                          : hasHeat
                          ? 'bg-rose-50/90 border-rose-200/70 shadow-rose-100/20 shadow-sm'
                          : isToday 
                          ? 'bg-warmgreen-50/80 border-warmgreen-200' 
                          : 'bg-warmbeige-50/70 border-warmbeige-100'
                        }
                        ${!isCurrentMonth ? 'opacity-60' : ''}
                      `}
                    >
                      <div className={`
                        text-xs py-1 px-2 flex justify-between items-center
                        ${hasOvulation ? 'font-bold text-purple-800' : hasFertility ? 'font-bold text-purple-800' : hasPregnancy ? `font-semibold ${primaryPregnancyColor.text}` : hasHeat ? 'font-semibold text-rose-700' : isToday ? 'font-bold text-primary' : ''}
                      `}>
                        <span>
                          {format(day, 'd')}
                        </span>
                        <div className="flex items-center gap-1">
                          {hasOvulation && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full shadow-sm"></div>
                          )}
                          {hasFertility && !hasOvulation && (
                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full shadow-sm"></div>
                          )}
                          {hasPregnancy && !hasOvulation && !hasFertility && (
                            <div className="flex gap-0.5">
                              {pregnancyColors.map((color, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 ${color.dot} rounded-full shadow-sm`}></div>
                              ))}
                            </div>
                          )}
                          {hasHeat && !hasOvulation && !hasFertility && !hasPregnancy && (
                            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full shadow-sm"></div>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {format(day, 'EEE')}
                          </span>
                        </div>
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
                          <div className="text-[10px] text-center p-1 bg-warmbeige-200 text-darkgray-600 rounded-lg">
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
