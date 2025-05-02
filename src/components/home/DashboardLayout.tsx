
import React, { useMemo, useEffect, useState } from 'react';
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import DashboardHero from './DashboardHero';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { DogsProvider } from '@/context/DogsContext';
import PageLayout from '@/components/PageLayout';
import BreedingStats from '@/components/BreedingStats';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { addDays, subDays } from 'date-fns';
import { User } from '@/types/auth';
import { useDogs } from '@/context/DogsContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { AddEventFormValues } from '@/components/calendar/types';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardLayoutProps {
  user: User | null;
  activePregnancies: ActivePregnancy[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies
}) => {
  // State for controlled loading
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  
  // Centralized data fetching for calendar and reminders
  const { dogs } = useDogs();
  
  // Single instances of these hooks to prevent duplicate fetching
  const { 
    reminders, 
    isLoading: remindersLoading, 
    hasError: remindersError,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  } = useBreedingReminders();
  
  const {
    getEventsForDate,
    getEventColor,
    addEvent,
    deleteEvent,
    editEvent,
    isLoading: calendarLoading,
    hasError: calendarError,
    calendarEvents
  } = useCalendarEvents(dogs);
  
  // Wrapper functions to adapt async functions to the synchronous interface expected by components
  const handleAddEvent = (data: AddEventFormValues) => {
    const result = addEvent(data);
    // Handle both synchronous boolean returns and Promises
    if (result instanceof Promise) {
      result.catch(err => {
        console.error("Error adding event:", err);
      });
    }
    return true; // Always return true synchronously for UI feedback
  };
  
  const handleEditEvent = (eventId: string, data: AddEventFormValues) => {
    const result = editEvent(eventId, data);
    // Handle both synchronous boolean returns and Promises
    if (result instanceof Promise) {
      result.catch(err => {
        console.error("Error editing event:", err);
      });
    }
    return true; // Always return true synchronously for UI feedback
  };
  
  // Get the personalized username
  const username = useMemo(() => {
    if (user?.firstName) {
      // Use first name if available (preferred)
      return user.firstName;
    } else if (user?.email) {
      // Fallback to email prefix
      return user.email.split('@')[0];
    }
    // Ultimate fallback
    return 'Breeder';
  }, [user]);
  
  // Sample data for planned litters and recent litters
  // In a real implementation, this would come from actual data services
  const plannedLittersData = useMemo(() => {
    return {
      count: 2,
      nextDate: addDays(new Date(), 14) // Example: next planned litter in 14 days
    };
  }, []);
  
  const recentLittersData = useMemo(() => {
    return {
      count: 3,
      latest: subDays(new Date(), 21) // Example: most recent litter was 21 days ago
    };
  }, []);
  
  const remindersSummary = useMemo(() => {
    const highPriorityCount = reminders.filter(r => r.priority === 'high' && !r.isCompleted).length;
    return {
      count: reminders.filter(r => !r.isCompleted).length,
      highPriority: highPriorityCount
    };
  }, [reminders]);
  
  // Controlled data loading with transition delay
  useEffect(() => {
    if (!remindersLoading && !calendarLoading) {
      // Set a moderate delay for stable transition
      const timer = setTimeout(() => {
        setIsDataReady(true);
      }, 300);
      
      // Clear timeout on cleanup
      return () => clearTimeout(timer);
    } else {
      // Reset the state if either data source is loading
      setIsDataReady(false);
    }
  }, [remindersLoading, calendarLoading, calendarEvents, reminders]);
  
  // Check if there's any data to display
  const hasCalendarData = calendarEvents && calendarEvents.length > 0;
  const hasReminderData = reminders && reminders.length > 0;
  
  return (
    <PageLayout 
      title="" 
      description=""
    >
      <div className="space-y-6">
        <DashboardHero 
          username={username}
          reminders={remindersSummary}
          plannedLitters={plannedLittersData}
          activePregnancies={activePregnancies}
          recentLitters={recentLittersData}
        />
        
        <div className="space-y-8 transition-all duration-300 ease-in-out">
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
                <BreedingCalendar 
                  eventsData={{
                    getEventsForDate,
                    getEventColor,
                    addEvent: handleAddEvent,
                    deleteEvent,
                    editEvent: handleEditEvent,
                    isLoading: calendarLoading,
                    hasError: calendarError
                  }}
                />
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
                <BreedingReminders 
                  remindersData={{
                    reminders,
                    isLoading: remindersLoading, 
                    hasError: remindersError,
                    handleMarkComplete
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Bottom row: Annual Breeding Statistics in a separate row (full width) */}
          <div>
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
      </div>
    </PageLayout>
  );
};

export default DashboardLayout;
