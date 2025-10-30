
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddEventFormValues } from '@/components/calendar/types';

// Static imports to replace lazy loading
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import { HomeOfferCarousel } from '@/components/home/HomeOfferCarousel';
import UpcomingHeatsCard from '@/components/home/UpcomingHeatsCard';

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

  return (
    <div className="space-y-6 pb-12">
      {/* Main content grid */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar taking 2/3 of the width */}
          <div className="lg:col-span-2">
            {showCalendarSkeleton ? (
              <CalendarSkeleton />
            ) : (
              <BreedingCalendar eventsData={calendarProps} />
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
