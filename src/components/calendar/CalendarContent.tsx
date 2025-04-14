
import React from 'react';
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
import { CalendarProvider, useCalendarContext } from './context/CalendarContext';
import { useCalendarDialogs } from './hooks/useCalendarDialogs';

interface CalendarContentProps {
  dogs: Dog[];
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventColor: (type: string) => string;
  onDeleteEvent: (eventId: string) => Promise<boolean>;
  onAddEvent: (data: AddEventFormValues) => Promise<boolean>;
  onEditEvent?: (eventId: string, data: AddEventFormValues) => Promise<boolean>;
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
  return (
    <CalendarProvider>
      <CalendarContentInner
        dogs={dogs}
        getEventsForDate={getEventsForDate}
        getEventColor={getEventColor}
        onDeleteEvent={onDeleteEvent}
        onAddEvent={onAddEvent}
        onEditEvent={onEditEvent}
        compact={compact}
      />
    </CalendarProvider>
  );
};

const CalendarContentInner: React.FC<CalendarContentProps> = ({
  dogs,
  getEventsForDate,
  getEventColor,
  onDeleteEvent,
  onAddEvent,
  onEditEvent,
  compact = false
}) => {
  const isMobile = useIsMobile();
  const { 
    currentDate,
    handlePrevMonth,
    handleNextMonth,
    weeks,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedEvent,
    handleEventClick,
    isLoading
  } = useCalendarContext();
  
  const { 
    handleAddEvent,
    handleEditEvent,
    handleDeleteSelectedEvent
  } = useCalendarDialogs({
    onAddEvent,
    onEditEvent,
    onDeleteEvent
  });
  
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
      
      {/* Event Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-cream-50">
          <DialogHeader>
            <DialogTitle>Add Calendar Event</DialogTitle>
          </DialogHeader>
          <AddEventDialog dogs={dogs} onSubmit={handleAddEvent} isLoading={isLoading} />
        </DialogContent>
      </Dialog>
      
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
              isLoading={isLoading}
              onDelete={handleDeleteSelectedEvent}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarContent;
