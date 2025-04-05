
import React from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { CalendarEvent } from './types';
import EventCard from './EventCard';
import MobileEventCard from './MobileEventCard';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CalendarGridProps {
  weeks: Date[][];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventColor: (type: string) => string;
  onDeleteEvent?: (eventId: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  weeks, 
  getEventsForDate,
  getEventColor,
  onDeleteEvent
}) => {
  const isMobile = useIsMobile();
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  
  const handleDeleteConfirm = () => {
    if (selectedEvent && onDeleteEvent) {
      onDeleteEvent(selectedEvent.id);
    }
    setIsAlertOpen(false);
    setSelectedEvent(null);
  };
  
  // Function to handle direct delete action
  const handleDeleteAction = (event: CalendarEvent) => {
    if (event.type === 'custom' && onDeleteEvent) {
      setSelectedEvent(event);
      setIsAlertOpen(true);
    }
  };
  
  return (
    <>
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
                        isMobile ? (
                          <MobileEventCard 
                            key={event.id} 
                            event={event} 
                            getEventColor={getEventColor}
                            onDelete={handleDeleteAction}
                          />
                        ) : (
                          <div key={event.id}>
                            {event.type === 'custom' && onDeleteEvent ? (
                              <ContextMenu>
                                <ContextMenuTrigger>
                                  <EventCard event={event} getEventColor={getEventColor} />
                                </ContextMenuTrigger>
                                <ContextMenuContent className="bg-white z-50">
                                  <ContextMenuItem 
                                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                                    onClick={() => handleDeleteAction(event)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Event
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
                            ) : (
                              <EventCard event={event} getEventColor={getEventColor} />
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CalendarGrid;
