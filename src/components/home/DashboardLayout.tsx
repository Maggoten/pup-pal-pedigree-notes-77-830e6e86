
import React, { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { DogsProvider } from '@/context/DogsContext'; 
import PageLayout from '@/components/PageLayout';
import DashboardHero from './dashboard-hero';
import DashboardContent from './DashboardContent';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
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
    console.log("[Dashboard] Dogs data status:", {
      count: dashboardData.dogs?.length || 0,
      loading: dashboardData.dogsLoading,
      dataReady: dashboardData.isDataReady,
    });
    
    // If there are dogs, log detailed information
    if (dashboardData.dogs?.length > 0) {
      console.log("[Dashboard] Sample dog data:", dashboardData.dogs[0].name, {
        gender: dashboardData.dogs[0].gender,
        hasVaccinationDate: !!dashboardData.dogs[0].vaccinationDate,
        hasHeatHistory: dashboardData.dogs[0].heatHistory?.length > 0
      });
    } else {
      console.warn("[Dashboard] No dogs available in context");
    }
    
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
        date: e.date instanceof Date ? e.date.toISOString() : e.date,
        dogName: e.dogName
      })));
    }
  }, [dashboardData.reminders, dashboardData.dogs, dashboardData.getEventsForDate, dashboardData.remindersLoading, 
      dashboardData.calendarLoading, dashboardData.remindersError, dashboardData.calendarError]);
  
  // Force refresh of data when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("[Dashboard] Initiating complete data refresh");
      dashboardData.refreshAllData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [dashboardData.refreshAllData]);
  
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
      
      {!dashboardData.hasReminderData && !dashboardData.hasCalendarData && 
       !dashboardData.remindersLoading && dashboardData.dogs.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
          <p className="text-yellow-800">
            No reminders or calendar events found. Try adding vaccination dates or heat cycles to your dogs to generate reminders.
          </p>
        </div>
      )}
      
      {dashboardData.dogs.length === 0 && !dashboardData.dogsLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
          <p className="text-blue-800">
            No dogs found in your account. Add your first dog to get started with reminders and the breeding calendar.
          </p>
        </div>
      )}
    </div>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies: initialActivePregnancies = [],
  isLoadingPregnancies: initialIsLoadingPregnancies = false
}) => {
  // State for active pregnancies
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>(initialActivePregnancies);
  const [isLoadingPregnancies, setIsLoadingPregnancies] = useState(initialIsLoadingPregnancies || initialActivePregnancies.length === 0);
  
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
