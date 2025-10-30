
import React, { useState } from 'react';
import { format, isSameMonth, isSameDay } from 'date-fns';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { CompactEventPill } from './CompactEventPill';
import MobileEventCard from './MobileEventCard';
import { PregnancyBandOverlay } from './PregnancyBandOverlay';
import { DayDetailsModal } from './DayDetailsModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarEvent } from './types';
import { isWithinDueDateUncertainty, calculateDueDate, normalizeDate } from '@/utils/pregnancyCalculations';
import { getEventCategory } from '@/utils/eventCategories';

interface CalendarGridProps {
  weeks: Date[][];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventColor: (type: string) => string;
  onDeleteEvent: (eventId: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  compact?: boolean;
  showPregnancyUnderlay?: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  weeks, 
  getEventsForDate, 
  getEventColor, 
  onDeleteEvent,
  onEventClick,
  compact = false,
  showPregnancyUnderlay = true
}) => {
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
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
      
      <div className="relative">
        {/* Calendar grid */}
        <div className="grid gap-1">
          {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const isToday = isSameDay(day, today);
              const isCurrentMonth = isSameMonth(day, new Date());
              const events = getEventsForDate(day);
              
              // Filter events by type
              const pregnancyEvents = events.filter(e => e.type === 'pregnancy-period');
              const matingEvents = events.filter(e => e.type === 'mating');
              const dueDateEvents = events.filter(e => e.type === 'due-date');
              const birthdayEvents = events.filter(e => e.type === 'birthday' || e.type === 'birthday-reminder');
              const otherEvents = events.filter(e => 
                !['pregnancy-period', 'mating', 'due-date', 'birthday', 'birthday-reminder'].includes(e.type || '')
              );
              
              // Combine displayable events: birthdays + others
              const displayableEvents = [...birthdayEvents, ...otherEvents];
              const maxEvents = compact ? 2 : 3;
              const displayEvents = displayableEvents.slice(0, maxEvents);
              const hiddenEventsCount = displayableEvents.length - maxEvents;
              
              // Check for special fertility/ovulation/heat events
              const hasOvulation = events.some(event => event.type === 'ovulation-predicted');
              const hasFertility = events.some(event => event.type === 'fertility-window');
              const hasHeat = events.some(event => event.type === 'heat' || event.type === 'heat-active');
              
              // Check for due date uncertainty shading
              const hasDueDateUncertainty = pregnancyEvents.some(p => {
                const dueDate = calculateDueDate(normalizeDate(p.startDate));
                return isWithinDueDateUncertainty(day, dueDate);
              });
              
              // Check for highlight rings
              const hasDueDate = dueDateEvents.length > 0;
              const hasBirthday = birthdayEvents.length > 0;
              
              // Prepare chips in priority order
              const chips = [
                ...(dueDateEvents.length > 0 ? [{ icon: '★', priority: 1, class: 'bg-rose-500' }] : []),
                ...(matingEvents.length > 0 ? [{ icon: '♥', priority: 2, class: 'bg-rose-500' }] : []),
                ...(birthdayEvents.length > 0 ? [{ icon: '🎂', priority: 3, class: 'bg-sky-500' }] : []),
              ].sort((a, b) => a.priority - b.priority);
              
              // Show "+N" chip if more than 3 pregnancies overlap
              const excessPregnancyCount = pregnancyEvents.length > 3 ? pregnancyEvents.length - 3 : 0;
              
              return (
                <ContextMenu key={day.toISOString()}>
                  <ContextMenuTrigger>
                    <div 
                      className={`
                        rounded-lg border h-full ${compact ? 'min-h-[80px]' : 'min-h-[100px]'}
                        flex flex-col transition-colors duration-200 cursor-pointer
                        ${hasDueDate 
                          ? 'ring-2 ring-rose-400/50 ring-offset-1' 
                          : hasBirthday 
                          ? 'ring-2 ring-sky-400/35 ring-offset-1'
                          : ''
                        }
                        ${hasOvulation 
                          ? 'bg-purple-100/90 border-purple-300/70 shadow-purple-200/30 shadow-lg' 
                          : hasFertility 
                          ? 'bg-purple-100/90 border-purple-300/70 shadow-purple-200/30 shadow-lg'
                          : hasDueDateUncertainty
                          ? 'bg-rose-50/10 border-warmbeige-100'
                          : hasHeat
                          ? 'bg-rose-50/90 border-rose-200/70 shadow-rose-100/20 shadow-sm'
                          : isToday 
                          ? 'bg-warmgreen-50/80 border-warmgreen-200' 
                          : 'bg-warmbeige-50/70 border-warmbeige-100'
                        }
                        ${!isCurrentMonth ? 'opacity-60' : ''}
                      `}
                      onClick={() => setSelectedDateForModal(day)}
                    >
                      {/* Date header - fixed 24px height */}
                      <div 
                        className="px-2 flex justify-between items-center border-b border-warmbeige-200/50"
                        style={{ height: '24px', minHeight: '24px', maxHeight: '24px' }}
                      >
                        <span className={`
                          text-xs font-medium
                          ${isToday ? 'font-bold text-primary' : ''}
                        `}>
                          {format(day, 'd')}
                        </span>
                        
                        <div className="flex items-center gap-0.5">
                          {/* Priority chips */}
                          {chips.map((chip, idx) => (
                            <span 
                              key={idx}
                              className={`text-[10px] text-white px-1 rounded shadow-sm ${chip.class}`}
                            >
                              {chip.icon}
                            </span>
                          ))}
                          
                          {/* Excess pregnancy count chip */}
                          {excessPregnancyCount > 0 && (
                            <span className="text-[9px] bg-gray-400 text-white px-1 rounded shadow-sm">
                              +{excessPregnancyCount}
                            </span>
                          )}
                          
                          {/* Indicators */}
                          {hasOvulation && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-1" title="Ovulation predicted" />
                          )}
                          {hasFertility && !hasOvulation && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Fertility window" />
                          )}
                          {hasHeat && !hasOvulation && !hasFertility && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Heat cycle" />
                          )}
                          
                          <span className="text-[9px] text-muted-foreground ml-1">
                            {format(day, 'EEE')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Event list - compact pills */}
                      <div className="flex-1 p-1.5 space-y-1 overflow-y-auto scrollbar-thin">
                        {displayEvents.map((event) => (
                          <CompactEventPill
                            key={event.id}
                            event={event}
                            onClick={() => handleEventClick(event)}
                          />
                        ))}
                        {hiddenEventsCount > 0 && (
                          <div 
                            className="text-[9px] text-center py-0.5 px-2 bg-gray-200/70 text-gray-600 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDateForModal(day);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedDateForModal(day);
                              }
                            }}
                            aria-label={`Show ${hiddenEventsCount} more events`}
                          >
                            +{hiddenEventsCount}
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
        
        {/* Pregnancy band overlay */}
        <PregnancyBandOverlay
          weeks={weeks}
          getEventsForDate={getEventsForDate}
          showUnderlay={showPregnancyUnderlay}
        />
      </div>
      
      {/* Day details modal */}
      <DayDetailsModal
        date={selectedDateForModal}
        events={selectedDateForModal ? getEventsForDate(selectedDateForModal) : []}
        onClose={() => setSelectedDateForModal(null)}
      />
      
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
