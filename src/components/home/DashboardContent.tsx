
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddEventFormValues } from '@/components/calendar/types';

// Static imports to replace lazy loading
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import { HomeOfferCarousel } from '@/components/home/HomeOfferCarousel';
import UpcomingHeatsCard from '@/components/home/UpcomingHeatsCard';
import { PregnancySwimLanes } from '@/components/calendar/PregnancySwimLanes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DashboardContentProps {
  isDataReady: boolean;
  calendarProps: {
    getEventsForDate: (date: Date) => any[];
    getEventColor: (type: string) => string;
    addEvent: (data: AddEventFormValues) => Promise<boolean> | boolean;
    deleteEvent: (eventId: string) => void;
    editEvent: (eventId: string, data: AddEventFormValues) => Promise<boolean> | boolean;
    isLoading: boolean;
    hasError: boolean;
    refreshEvents?: () => void;
  };
  remindersProps: {
    reminders: any[];
    isLoading: boolean;
    hasError: boolean;
    handleMarkComplete: (id: string) => void;
  };
  remindersDialogOpen?: boolean;
  setRemindersDialogOpen?: (open: boolean) => void;
}

const CalendarSkeleton = () => (
  <div className="rounded-lg bg-greige-50 border border-greige-200 p-4 shadow-sm transition-opacity duration-200">
    <div className="flex flex-col">
      <Skeleton className="h-14 w-full mb-4" />
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array(7).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array(35).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  </div>
);

const RemindersSkeleton = () => (
  <div className="rounded-lg bg-greige-50 border border-greige-200 p-4 shadow-sm transition-opacity duration-200">
    <div className="flex flex-col">
      <Skeleton className="h-14 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-8" />
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="mb-4">
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

const CarouselSkeleton = () => (
  <div className="rounded-lg bg-greige-50 border border-greige-200 p-4 shadow-sm transition-opacity duration-200">
    <Skeleton className="h-32 w-full" />
  </div>
);

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  isDataReady, 
  calendarProps, 
  remindersProps,
  remindersDialogOpen,
  setRemindersDialogOpen
}) => {
  const showCalendarSkeleton = !isDataReady || calendarProps.isLoading;
  const showRemindersSkeleton = !isDataReady || remindersProps.isLoading;
  const showCarouselSkeleton = !isDataReady;
  
  // Pregnancy Focus toggle state
  const [showPregnancyFocus, setShowPregnancyFocus] = useState(() => {
    const saved = localStorage.getItem('pregnancyFocus');
    return saved === 'true';
  });
  
  // Get all pregnancy events for swimlanes
  const allPregnancies = React.useMemo(() => {
    if (!calendarProps.getEventsForDate || showCalendarSkeleton) return [];
    
    // Collect all unique pregnancy events from the calendar
    const pregnancies: any[] = [];
    const seenIds = new Set<string>();
    
    // Check dates for next 90 days to capture all pregnancies
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const events = calendarProps.getEventsForDate(date);
      
      events.forEach(event => {
        if (event.type === 'pregnancy-period' && !seenIds.has(event.id)) {
          seenIds.add(event.id);
          pregnancies.push(event);
        }
      });
    }
    
    return pregnancies;
  }, [calendarProps, showCalendarSkeleton]);
  
  const handleTogglePregnancyFocus = (checked: boolean) => {
    setShowPregnancyFocus(checked);
    localStorage.setItem('pregnancyFocus', String(checked));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Main content grid */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar taking 2/3 of the width */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pregnancy Focus Toggle */}
            {!showCalendarSkeleton && allPregnancies.length > 0 && (
              <div className="flex items-center justify-end gap-2 px-1">
                <Label htmlFor="pregnancy-focus" className="text-sm text-muted-foreground cursor-pointer">
                  Visa dräktighetsöversikt
                </Label>
                <Switch 
                  id="pregnancy-focus"
                  checked={showPregnancyFocus}
                  onCheckedChange={handleTogglePregnancyFocus}
                />
              </div>
            )}
            
            {/* Pregnancy Swimlanes */}
            {showPregnancyFocus && !showCalendarSkeleton && (
              <PregnancySwimLanes pregnancies={allPregnancies} />
            )}
            
            {/* Calendar */}
            {showCalendarSkeleton ? (
              <CalendarSkeleton />
            ) : (
              <BreedingCalendar 
                eventsData={calendarProps}
              />
            )}
          </div>
          
          {/* Right column with reminders and carousel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Reminders */}
            <div>
              {showRemindersSkeleton ? (
                <RemindersSkeleton />
              ) : (
                <BreedingReminders 
                  remindersData={remindersProps}
                  remindersDialogOpen={remindersDialogOpen}
                  setRemindersDialogOpen={setRemindersDialogOpen}
                />
              )}
            </div>
            
            {/* Upcoming Heats Card */}
            <div>
              <UpcomingHeatsCard />
            </div>
            
            {/* Carousel beneath reminders */}
            <div>
              {showCarouselSkeleton ? (
                <CarouselSkeleton />
              ) : (
                <HomeOfferCarousel />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardContent;
