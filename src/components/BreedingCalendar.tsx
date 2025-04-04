
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'heat' | 'mating' | 'due-date' | 'planned-mating';
  dogId: string;
  dogName: string;
}

// Sample data
const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Heat Cycle',
    date: new Date(2025, 3, 10), // April 10, 2025
    type: 'heat',
    dogId: '2',
    dogName: 'Bella'
  },
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

const BreedingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents] = useState<CalendarEvent[]>(sampleEvents);
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  
  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  // Create an array of dates for the next 4 weeks
  const calendarDays = Array.from({ length: 28 }, (_, index) => {
    return addDays(startDate, index);
  });
  
  // Group days by week
  const weeks = Array.from({ length: 4 }, (_, weekIndex) => {
    return calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7);
  });
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };
  
  // Function to determine event color based on type
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
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Breeding Calendar
          </CardTitle>
          <CardDescription>
            Track heats, matings, and due dates
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
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
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 min-w-[700px]">
            {/* Day headers */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-medium py-1 text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar grid */}
            {weeks.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                  
                  return (
                    <div 
                      key={format(day, 'yyyy-MM-dd')} 
                      className={`min-h-[100px] p-1 border rounded text-sm ${
                        isToday ? 'bg-secondary/50 border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <div className="font-medium text-right mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <div 
                            key={event.id}
                            className={`p-1 rounded text-xs border ${getEventColor(event.type)}`}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div>{event.dogName}</div>
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
