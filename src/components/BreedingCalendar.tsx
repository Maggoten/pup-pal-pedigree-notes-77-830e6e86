
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useIsMobile } from '@/hooks/use-mobile';

// Import our components
import CalendarHeader from './calendar/CalendarHeader';
import CalendarGrid from './calendar/CalendarGrid';
import AddEventDialog from './calendar/AddEventDialog';
import { CalendarEvent, AddEventFormValues, DeleteEventParams } from './calendar/types';

const BreedingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { dogs } = useDogs();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Load events from localStorage if available
    const savedEvents = localStorage.getItem('breedingCalendarEvents');
    const customEvents = savedEvents ? JSON.parse(savedEvents).map((event: any) => ({
      ...event,
      date: new Date(event.date)
    })) : [];
    
    const sampleEvents: CalendarEvent[] = [
      {
        id: '2',
        title: 'Planned Mating',
        date: new Date(2025, 3, 12), // April 12, 2025
        type: 'planned-mating',
        dogId: '2',
        dogName: 'Bella'
      },
      {
        id: '3',
        title: 'Due Date',
        date: new Date(2025, 4, 5), // May 5, 2025
        type: 'due-date',
        dogId: '2',
        dogName: 'Bella'
      }
    ];
    
    const upcomingHeats = calculateUpcomingHeats(dogs);
    
    const heatEvents: CalendarEvent[] = upcomingHeats.map((heat, index) => ({
      id: `heat-${heat.dogId}-${index}`,
      title: 'Heat Cycle',
      date: heat.date,
      type: 'heat',
      dogId: heat.dogId,
      dogName: heat.dogName
    }));
    
    setCalendarEvents([...sampleEvents, ...heatEvents, ...customEvents]);
  }, [dogs]);
  
  // Save custom events to localStorage whenever they change
  useEffect(() => {
    const customEvents = calendarEvents.filter(event => event.type === 'custom');
    if (customEvents.length > 0) {
      localStorage.setItem('breedingCalendarEvents', JSON.stringify(customEvents));
    }
  }, [calendarEvents]);
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  
  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  // On mobile, we show 2 weeks at a time instead of 4 to make it more readable
  const weeksToShow = isMobile ? 2 : 4;
  
  const calendarDays = Array.from({ length: weeksToShow * 7 }, (_, index) => {
    return addDays(startDate, index);
  });
  
  const weeks = Array.from({ length: weeksToShow }, (_, weekIndex) => {
    return calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
  });
  
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };
  
  const getEventColor = (type: string) => {
    switch (type) {
      case 'heat':
        return 'bg-rose-100 border-rose-300 text-rose-800';
      case 'mating':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'planned-mating':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'due-date':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'custom':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };
  
  const handleSubmit = (data: AddEventFormValues) => {
    // Combine date and time
    const combinedDate = new Date(data.date);
    if (data.time) {
      const [hours, minutes] = data.time.split(':').map(Number);
      combinedDate.setHours(hours, minutes);
    }
    
    const newEvent: CalendarEvent = {
      id: uuidv4(),
      title: data.title,
      date: combinedDate,
      time: data.time,
      type: 'custom',
      notes: data.notes
    };
    
    if (data.dogId) {
      const selectedDog = dogs.find(dog => dog.id === data.dogId);
      if (selectedDog) {
        newEvent.dogId = data.dogId;
        newEvent.dogName = selectedDog.name;
      }
    }
    
    setCalendarEvents([...calendarEvents, newEvent]);
    setIsDialogOpen(false);
    
    toast({
      title: "Event Added",
      description: "Your event has been added to the calendar.",
    });
  };

  // Function to handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    // Only filter out custom events (system events cannot be deleted)
    const eventToDelete = calendarEvents.find(event => event.id === eventId);
    
    if (eventToDelete && eventToDelete.type === 'custom') {
      const updatedEvents = calendarEvents.filter(event => event.id !== eventId);
      setCalendarEvents(updatedEvents);
      
      // Update localStorage
      const customEvents = updatedEvents.filter(event => event.type === 'custom');
      localStorage.setItem('breedingCalendarEvents', JSON.stringify(customEvents));
      
      toast({
        title: "Event Deleted",
        description: "Your event has been removed from the calendar.",
      });
    }
  };
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-cream-50 to-cream-100">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <CalendarHeader 
          currentDate={currentDate}
          startDate={startDate}
          handlePrevWeek={handlePrevWeek}
          handleNextWeek={handleNextWeek}
        />
        
        <CardContent className="p-4 bg-gradient-to-br from-cream-50 to-[#FFDEE2]/30">
          <div className={isMobile ? "overflow-x-auto -mx-4 px-4" : ""}>
            <CalendarGrid 
              weeks={weeks}
              getEventsForDate={getEventsForDate}
              getEventColor={getEventColor}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        </CardContent>
        
        <AddEventDialog dogs={dogs} onSubmit={handleSubmit} />
      </Dialog>
    </Card>
  );
};

export default BreedingCalendar;
