
import React, { useState } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import CalendarGrid from './CalendarGrid';
import CalendarHeader from './CalendarHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddEventDialog from './AddEventDialog';
import EditEventDialog from './EditEventDialog';
import { Dog } from '@/context/DogsContext';
import { AddEventFormValues } from './types';
import { CalendarEvent } from './types';

interface CalendarContentProps {
  dogs: Dog[];
  getEventsForDate: (date: Date) => any[];
  getEventColor: (type: string) => string;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (data: AddEventFormValues) => boolean;
  onEditEvent?: (eventId: string, data: AddEventFormValues) => boolean;
  compact?: boolean;
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  dogs,
  getEventsForDate,
  getEventColor,
  onDeleteEvent,
  onAddEvent,
  onEditEvent,
  compact = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const isMobile = useIsMobile();
  
  // Get the first day of the current month
  const startDate = startOfMonth(currentDate);
  // Get the last day of the current month
  const endDate = endOfMonth(currentDate);
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Generate all days in the current month
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Create weeks array for the calendar
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Add days from previous month to start the calendar on Monday
  const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToAddBefore = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), add 6 days before, else add (dayOfWeek - 1)
  
  for (let i = daysToAddBefore; i > 0; i--) {
    currentWeek.push(addDays(startDate, -i));
  }
  
  // Add all days from the current month
  allDaysInMonth.forEach((day, index) => {
    currentWeek.push(day);
    
    // If we've added 7 days to the current week or this is the last day
    if (currentWeek.length === 7 || index === allDaysInMonth.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // If the last week is not complete, add days from the next month
  if (currentWeek.length > 0 && currentWeek.length < 7) {
    const daysToAddAfter = 7 - currentWeek.length;
    for (let i = 1; i <= daysToAddAfter; i++) {
      currentWeek.push(addDays(endDate, i));
    }
    weeks.push(currentWeek);
  }
  
  const handleAddEvent = (data: AddEventFormValues) => {
    const success = onAddEvent(data);
    if (success) {
      setIsAddDialogOpen(false);
    }
    return success;
  };
  
  const handleEditEvent = (data: AddEventFormValues) => {
    if (selectedEvent && onEditEvent) {
      const success = onEditEvent(selectedEvent.id, data);
      if (success) {
        setIsEditDialogOpen(false);
        setSelectedEvent(null);
      }
      return success;
    }
    return false;
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };
  
  return (
    <>
      <CalendarHeader 
        currentDate={currentDate}
        handlePrevMonth={handlePrevMonth}
        handleNextMonth={handleNextMonth}
        onAddEvent={() => setIsAddDialogOpen(true)}
      />
      
      <CardContent className={`p-3 bg-gradient-to-br from-cream-50 to-[#FFDEE2]/30 ${compact ? 'max-h-[300px] overflow-y-auto' : ''}`}>
        {isMobile && (
          <div className="text-xs text-gray-500 mb-2">
            Tap events to view/edit
          </div>
        )}
        <div className={isMobile ? "overflow-x-auto -mx-4 px-4" : ""}>
          <CalendarGrid 
            weeks={weeks}
            getEventsForDate={getEventsForDate}
            getEventColor={getEventColor}
            onDeleteEvent={onDeleteEvent}
            onEventClick={handleEventClick}
            compact={compact}
          />
        </div>
      </CardContent>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-cream-50">
          <DialogHeader>
            <DialogTitle>Add Calendar Event</DialogTitle>
          </DialogHeader>
          <AddEventDialog dogs={dogs} onSubmit={handleAddEvent} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-cream-50">
          <DialogHeader>
            <DialogTitle>Edit Calendar Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EditEventDialog 
              event={selectedEvent}
              dogs={dogs} 
              onSubmit={handleEditEvent}
              onDelete={() => {
                onDeleteEvent(selectedEvent.id);
                setIsEditDialogOpen(false);
                setSelectedEvent(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarContent;
