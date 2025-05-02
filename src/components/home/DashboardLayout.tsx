
import React from 'react';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { DogsProvider } from '@/context/DogsContext';
import PageLayout from '@/components/PageLayout';
import DashboardHero from './dashboard-hero';
import DashboardContent from './DashboardContent';
import { useDashboardData } from '@/hooks/useDashboardData';
import { getDisplayUsername } from '@/utils/userDisplayUtils';

interface DashboardLayoutProps {
  user: User | null;
  activePregnancies: ActivePregnancy[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies
}) => {
  // Use the custom hook to get all dashboard data and functions
  const dashboardData = useDashboardData();
  
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
