import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddEventFormValues } from '@/components/calendar/types';

// Static imports to replace lazy loading
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import BreedingStats from '@/components/BreedingStats';
import { HomeOfferCarousel } from '@/components/home/HomeOfferCarousel';

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

const StatsSkeleton = () => (
  <div className="rounded-lg bg-greige-50 border border-greige-200 p-4 shadow-sm transition-opacity duration-200">
    <div className="flex flex-col">
      <Skeleton className="h-14 w-full mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="h-16 w-16 rounded-full mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
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
  const showStatsSkeleton = !isDataReady;

  return (
    <div className="space-y-12 pb-12">
      {/* Calendar and Reminders section */}
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
          
          {/* Reminders taking 1/3 of the width */}
          <div className="lg:col-span-1">
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
        </div>
      </section>
      
      {/* Home Offer Carousel section */}
      <section>
        <HomeOfferCarousel />
      </section>
      
      {/* Annual Breeding Statistics in a separate section */}
      <section>
        {showStatsSkeleton ? (
          <StatsSkeleton />
        ) : (
          <BreedingStats />
        )}
      </section>
    </div>
  );
};

export default DashboardContent;
