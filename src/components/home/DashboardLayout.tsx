
import React, { useMemo, useState, useEffect } from 'react';
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

interface DashboardLayoutProps {
  user: User | null;
  activePregnancies: ActivePregnancy[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies
}) => {
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
    hasError: calendarError
  } = useCalendarEvents(dogs);
  
  // Wrapper functions to adapt async functions to the synchronous interface
  // These will always return true synchronously while the async operations happen in the background
  const handleAddEvent = (data: AddEventFormValues) => {
    addEvent(data); // We don't await this
    return true; // Return synchronously for UI feedback
  };
  
  const handleEditEvent = (eventId: string, data: AddEventFormValues) => {
    editEvent(eventId, data); // We don't await this
    return true; // Return synchronously for UI feedback
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
    const highPriorityCount = reminders.filter(r => r.priority === 'high').length;
    return {
      count: reminders.length,
      highPriority: highPriorityCount
    };
  }, [reminders]);
  
  // Only render children when data is loaded to prevent flickering
  const [isInitialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    if (!remindersLoading && !calendarLoading) {
      // Give a small delay for stability
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [remindersLoading, calendarLoading]);
  
  return (
    <PageLayout 
      title="" 
      description=""
    >
      <div className="space-y-4">
        <DashboardHero 
          username={username}
          reminders={remindersSummary}
          plannedLitters={plannedLittersData}
          activePregnancies={activePregnancies}
          recentLitters={recentLittersData}
        />
        
        {isInitialLoading ? (
          // Skeleton placeholder with exact same dimensions to prevent layout shift
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
              <div className="lg:col-span-2 h-full bg-greige-50 rounded-lg animate-pulse"></div>
              <div className="lg:col-span-1 h-full bg-greige-50 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-[350px] bg-greige-50 rounded-lg animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top row: Calendar (2/3) and Reminders (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
              {/* Calendar taking 2/3 of the width */}
              <div className="lg:col-span-2 h-full">
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
              </div>
              
              {/* Reminders taking 1/3 of the width */}
              <div className="lg:col-span-1 h-full">
                <BreedingReminders 
                  remindersData={{
                    reminders,
                    isLoading: remindersLoading, 
                    hasError: remindersError,
                    handleMarkComplete
                  }}
                />
              </div>
            </div>
            
            {/* Bottom row: Annual Breeding Stats (full width) */}
            <div className="h-[350px]">
              <BreedingStats />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default DashboardLayout;
