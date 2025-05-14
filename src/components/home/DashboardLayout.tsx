
import React, { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import PageLayout from '@/components/PageLayout';
import DashboardHero from './dashboard-hero';
import DashboardContent from './DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';
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
  
  // Get the personalized username for display
  const username = user?.firstName || (user?.email ? user.email.split('@')[0] : 'Breeder');
  
  // Prepare props for child components
  const calendarProps = {
    getEventsForDate: dashboardData.getEventsForDate,
    getEventColor: dashboardData.getEventColor,
    addEvent: dashboardData.handleAddEvent,
    deleteEvent: dashboardData.deleteEvent,
    editEvent: dashboardData.handleEditEvent,
    isLoading: dashboardData.calendarLoading || false,
    hasError: dashboardData.calendarError || false
  };
  
  const remindersProps = {
    reminders: dashboardData.reminders,
    isLoading: dashboardData.remindersLoading,
    hasError: dashboardData.remindersError,
    handleMarkComplete: dashboardData.handleMarkComplete
  };

  // Debug logging
  console.log('[DashboardLayout] Rendering with data:', {
    reminders: dashboardData.remindersSummary,
    plannedLitters: dashboardData.plannedLittersData,
    activePregnanciesCount: activePregnancies?.length || 0,
    isLoadingPregnancies
  });
  
  // Ensure plannedLittersData.nextDate is handled properly (could be null)
  const enhancedPlannedLittersData = {
    count: dashboardData.plannedLittersData.count,
    nextDate: dashboardData.plannedLittersData.nextDate || new Date() // Provide fallback date if null
  };
  
  return (
    <PageLayout 
      title="" 
      description=""
    >
      <div className="space-y-6">
        <DashboardHero 
          user={user}
          username={username}
          reminders={dashboardData.remindersSummary}
          plannedLitters={enhancedPlannedLittersData}
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
