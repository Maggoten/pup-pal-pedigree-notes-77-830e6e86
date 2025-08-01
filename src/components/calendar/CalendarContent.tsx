
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
import { useTranslation } from 'react-i18next';

interface CalendarContentProps {
  dogs: Dog[];
  getEventsForDate: (date: Date) => any[];
  getEventColor: (type: string) => string;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (data: AddEventFormValues) => boolean;
  onEditEvent?: (eventId: string, data: AddEventFormValues) => boolean;
  compact?: boolean;
  onSyncCalendar?: () => void;
  isSyncing?: boolean;
  onEventUpdate?: () => void;
}

const CalendarContent: React.FC<CalendarContentProps> = ({ 
  dogs, 
  getEventsForDate, 
  getEventColor, 
  onDeleteEvent, 
  onAddEvent, 
  onEditEvent, 
  compact = false, 
  onSyncCalendar, 
  isSyncing = false,
  onEventUpdate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation('home');
  
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };
  
  const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  const dayOfWeek = startDate.getDay();
  const daysToAddBefore = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  for (let i = daysToAddBefore; i > 0; i--) {
    currentWeek.push(addDays(startDate, -i));
  }
  
  allDaysInMonth.forEach((day, index) => {
    currentWeek.push(day);
    
    if (currentWeek.length === 7 || index === allDaysInMonth.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
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
        todayButton={true}
        onTodayClick={handleTodayClick}
        onSyncCalendar={onSyncCalendar}
        isSyncing={isSyncing}
      />
      
      <CardContent className={`p-3 bg-white border-t border-warmbeige-100 ${compact ? 'max-h-[300px] overflow-y-auto' : ''}`}>
        {isMobile && (
          <div className="text-xs text-darkgray-500 mb-2">
            {t('calendar.tapToEdit')}
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
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white border border-warmbeige-200">
          <DialogHeader>
            <DialogTitle>{t('dialogs.addEvent.title')}</DialogTitle>
          </DialogHeader>
          <AddEventDialog dogs={dogs} onSubmit={handleAddEvent} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border border-warmbeige-200">
          <DialogHeader>
            <DialogTitle>{t('dialogs.editEvent.title')}</DialogTitle>
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
              onEventUpdate={onEventUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarContent;
