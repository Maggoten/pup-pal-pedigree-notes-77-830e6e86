
import React, { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import PageLayout from '@/components/PageLayout';
import DashboardHero from './dashboard-hero';
import DashboardContent from './DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';
import { getDisplayUsername } from '@/utils/userDisplayUtils';
import { getActivePregnancies } from '@/services/PregnancyService';
import { toast } from '@/components/ui/use-toast';
import { useReminders } from '@/hooks/useReminders';

interface DashboardLayoutProps {
  user: User | null;
  activePregnancies?: ActivePregnancy[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies: initialActivePregnancies = []
}) => {
  // State for active pregnancies
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>(initialActivePregnancies);
  const [isLoadingPregnancies, setIsLoadingPregnancies] = useState(initialActivePregnancies.length === 0);
  
  // Use the custom hook to get all dashboard data and functions
  const dashboardData = useDashboardData();
  
  // Use our new reminders hook
  const { 
    reminders,
    isLoading: remindersLoading,
    hasError: remindersError,
    handleMarkComplete
  } = useReminders();
  
  // Fetch active pregnancies if not provided
  useEffect(() => {
    const fetchActivePregnancies = async () => {
      if (initialActivePregnancies.length === 0) {
        try {
          setIsLoadingPregnancies(true);
          const pregnancies = await getActivePregnancies();
          setActivePregnancies(pregnancies);
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
  
  // Get the personalized username for initial display while we fetch from Supabase
  const username = user?.firstName || (user?.email ? user.email.split('@')[0] : 'Breeder');
  
  // Prepare props for child components
  const calendarProps = {
    getEventsForDate: dashboardData.getEventsForDate,
    getEventColor: dashboardData.getEventColor,
    addEvent: dashboardData.handleAddEvent,
    deleteEvent: dashboardData.deleteEvent,
    editEvent: dashboardData.handleEditEvent,
    isLoading: dashboardData.calendarLoading,
    hasError: dashboardData.calendarError // This now receives a boolean value
  };
  
  const remindersProps = {
    reminders,
    isLoading: remindersLoading,
    hasError: remindersError,
    handleMarkComplete
  };
  
  // Calculate reminders summary for the hero section
  const remindersSummary = React.useMemo(() => {
    return {
      count: reminders.length,
      highPriority: reminders.filter(r => r.priority === 'high' && !r.isCompleted).length
    };
  }, [reminders]);
  
  return (
    <PageLayout 
      title="" 
      description=""
    >
      <div className="space-y-6">
        <DashboardHero 
          username={username}
          user={user}
          reminders={remindersSummary}
          plannedLitters={dashboardData.plannedLittersData}
          activePregnancies={activePregnancies}
          recentLitters={dashboardData.recentLittersData}
          isLoadingPregnancies={isLoadingPregnancies}
        />
        
        <DashboardContent
          isDataReady={!remindersLoading && !dashboardData.calendarLoading}
          calendarProps={calendarProps}
          remindersProps={remindersProps}
        />
      </div>
    </PageLayout>
  );
};

export default DashboardLayout;
