
import React from 'react';
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import BreedingStats from '@/components/BreedingStats';
import { Skeleton } from '@/components/ui/skeleton';
import { AddEventFormValues } from '@/components/calendar/types';

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
  };
  remindersProps: {
    reminders: any[];
    isLoading: boolean;
    hasError: boolean;
    handleMarkComplete: (id: string) => void;
  };
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  isDataReady, 
  calendarProps, 
  remindersProps 
}) => {
  return (
    <div className="transition-all duration-300 ease-in-out">
      {/* Calendar and Reminders row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Calendar taking 2/3 of the width */}
        <div className="lg:col-span-2 h-full">
          {!isDataReady ? (
            <div className="h-full rounded-lg bg-greige-50 border border-greige-200 p-4 shadow-sm transition-opacity duration-200">
              <div className="flex flex-col h-full">
                <Skeleton className="h-14 w-full mb-4" />
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {Array(7).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 flex-grow">
                  {Array(35).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-full w-full min-h-[80px]" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <BreedingCalendar eventsData={calendarProps} />
          )}
        </div>
        
        {/* Reminders taking 1/3 of the width */}
        <div className="lg:col-span-1 h-full">
          {!isDataReady ? (
            <div className="h-full rounded-lg bg-greige-50 border border-greige-200 p-4 shadow-sm transition-opacity duration-200">
              <div className="flex flex-col h-full">
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
          ) : (
            <BreedingReminders remindersData={remindersProps} />
          )}
        </div>
      </div>
      
      {/* Annual Breeding Statistics in a separate row (full width) */}
      <div className="pt-4">
        {!isDataReady ? (
          <div className="h-[350px] rounded-lg bg-greige-50 border border-greige-200 p-4 shadow-sm transition-opacity duration-200">
            <div className="flex flex-col h-full">
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
        ) : (
          <BreedingStats />
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
