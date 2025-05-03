
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
  
  // Get the personalized username
  const username = getDisplayUsername(user);
  
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
    <PageLayout 
      title="" 
      description=""
    >
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
    </PageLayout>
  );
};

export default DashboardLayout;
