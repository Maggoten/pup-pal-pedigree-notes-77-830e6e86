
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, addWeeks, subWeeks, parseISO, setHours, setMinutes } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { calculateUpcomingHeats, UpcomingHeat } from '@/utils/heatCalculator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'heat' | 'mating' | 'due-date' | 'planned-mating' | 'custom';
  dogId?: string;
  dogName?: string;
  notes?: string;
}

interface AddEventFormValues {
  title: string;
  date: Date;
  time: string;
  type: string;
  dogId?: string;
  notes?: string;
}

const BreedingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { dogs } = useDogs();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<AddEventFormValues>({
    defaultValues: {
      title: '',
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      type: 'custom',
      notes: ''
    }
  });
  
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
  
  const calendarDays = Array.from({ length: 28 }, (_, index) => {
    return addDays(startDate, index);
  });
  
  const weeks = Array.from({ length: 4 }, (_, weekIndex) => {
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
    form.reset();
    
    toast({
      title: "Event Added",
      description: "Your event has been added to the calendar.",
    });
  };
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-cream-50 to-cream-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-primary/5 border-b border-primary/20">
        <div>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CalendarIcon className="h-5 w-5" />
            Breeding Calendar
          </CardTitle>
          <CardDescription>
            Track heats, matings, and due dates
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-cream-50">
              <DialogHeader>
                <DialogTitle>Add Calendar Event</DialogTitle>
                <DialogDescription>
                  Add a custom event to your breeding calendar
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Event Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full justify-start text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Time</FormLabel>
                          <div className="flex items-center">
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                className="flex-1"
                              />
                            </FormControl>
                            <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="dogId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Associated Dog (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a dog (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dogs.map((dog) => (
                              <SelectItem key={dog.id} value={dog.id}>
                                {dog.name} ({dog.gender})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Add notes about this event" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">Add Event</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(startDate, 'MMM d')} - {format(addDays(startDate, 27), 'MMM d, yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 bg-gradient-to-br from-cream-50 to-[#FFDEE2]/30">
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
      </CardContent>
    </Card>
  );
};

export default BreedingCalendar;
