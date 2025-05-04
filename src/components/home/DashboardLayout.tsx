
import React, { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { DogsProvider } from '@/context/DogsContext'; 
import PageLayout from '@/components/PageLayout';
import DashboardHero from './dashboard-hero';
import DashboardContent from './DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';
import { getDisplayUsername } from '@/utils/userDisplayUtils';
import { getActivePregnancies } from '@/services/PregnancyService';
import { toast } from '@/components/ui/use-toast';

interface DashboardLayoutProps {
  user: User | null;
  activePregnancies?: ActivePregnancy[];
  isLoadingPregnancies?: boolean;
}

// Create a wrapper component that will use the dashboard data inside the DogsProvider
const DashboardContentWithData: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies,
  isLoadingPregnancies
}) => {
  // Use the custom hook to get all dashboard data and functions
  const dashboardData = useDashboardData();
  
  // Get the personalized username
  const username = getDisplayUsername(user);
  
  // Log important data for debugging
  useEffect(() => {
    console.log("[Dashboard] Reminders data:", {
      count: dashboardData.reminders?.length || 0,
      loading: dashboardData.remindersLoading,
      hasError: dashboardData.remindersError
    });
    
    // Log a sample of the reminders if available
    if (dashboardData.reminders?.length > 0) {
      const sampleReminders = dashboardData.reminders.slice(0, 3);
      console.log("[Dashboard] Sample reminders:", sampleReminders.map(r => ({
        title: r.title,
        type: r.type,
        dueDate: r.dueDate instanceof Date ? r.dueDate.toISOString() : r.dueDate,
        priority: r.priority,
        isCompleted: r.isCompleted
      })));
    }
    
    // Log calendar events data
    const today = new Date();
    const eventsForToday = dashboardData.getEventsForDate(today);
    console.log("[Dashboard] Calendar events for today:", {
      count: eventsForToday.length,
      loading: dashboardData.calendarLoading,
      hasError: dashboardData.calendarError
    });
    
    if (eventsForToday.length > 0) {
      console.log("[Dashboard] Sample events for today:", eventsForToday.map(e => ({
        title: e.title,
        type: e.type,
        date: e instanceof Date ? e.date.toISOString() : e.date,
        dogName: e.dogName
      })));
    }
  }, [dashboardData.reminders, dashboardData.getEventsForDate, dashboardData.remindersLoading, 
      dashboardData.calendarLoading, dashboardData.remindersError, dashboardData.calendarError]);
  
  // Force refresh of data when the component mounts
  useEffect(() => {
    // A brief timeout to allow for initial data loading
    const timer = setTimeout(() => {
      console.log("[Dashboard] Forcing refresh of reminders and calendar data");
      dashboardData.refreshReminderData();
      dashboardData.refreshCalendarData();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [dashboardData.refreshReminderData, dashboardData.refreshCalendarData]);
  
  // Prepare props for child components
  const calendarProps = {
    getEventsForDate: dashboardData.getEventsForDate,
    getEventColor: dashboardData.getEventColor,
    addEvent: dashboardData.handleAddEvent,
    deleteEvent: dashboardData.deleteEvent,
    editEvent: dashboardData.handleEditEvent,
    isLoading: dashboardData.calendarLoading,
    hasError: dashboardData.calendarError
  };
  
  const remindersProps = {
    reminders: dashboardData.reminders,
    isLoading: dashboardData.remindersLoading,
    hasError: dashboardData.remindersError,
    handleMarkComplete: dashboardData.handleMarkComplete
  };
  
  return (
    <div className="space-y-6">
      <DashboardHero 
        username={username}
        reminders={dashboardData.remindersSummary}
        plannedLitters={dashboardData.plannedLittersData}
        activePregnancies={activePregnancies}
        recentLitters={dashboardData.recentLittersData}
        isLoadingPregnancies={isLoadingPregnancies}
      />
      
      <DashboardContent
        isDataReady={dashboardData.isDataReady}
        calendarProps={calendarProps}
        remindersProps={remindersProps}
      />
    </div>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies: initialActivePregnancies = []
}) => {
  // State for active pregnancies
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>(initialActivePregnancies);
  const [isLoadingPregnancies, setIsLoadingPregnancies] = useState(initialActivePregnancies.length === 0);
  
  // Fetch active pregnancies if not provided
  useEffect(() => {
    const fetchActivePregnancies = async () => {
      if (initialActivePregnancies.length === 0) {
        try {
          setIsLoadingPregnancies(true);
          const pregnancies = await getActivePregnancies();
          setActivePregnancies(pregnancies);
          console.log(`[Dashboard] Fetched ${pregnancies.length} active pregnancies`);
        } catch (error) {
          console.error("Error fetching active pregnancies:", error);
          toast({
            title: "Error",
            description: "Could not load active pregnancies",
            variant: "destructive"
          });
        } finally {
          setIsLoadingPregnancies(false);
        }
      }
    };
    
    fetchActivePregnancies();
  }, [initialActivePregnancies.length]);
  
  return (
    <PageLayout 
      title="" 
      description=""
    >
      <DogsProvider>
        <DashboardContentWithData 
          user={user} 
          activePregnancies={activePregnancies}
          isLoadingPregnancies={isLoadingPregnancies}
        />
      </DogsProvider>
    </PageLayout>
  );
};

export default DashboardLayout;
