
import React, { useState, useEffect } from 'react';
import DashboardHero from './dashboard-hero';
import DashboardContent from './DashboardContent';
import { User } from '@/types/auth';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import ActivePregnanciesSection from './ActivePregnanciesSection';
import { useBreedingReminders } from '@/hooks/reminders';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useQuery } from '@tanstack/react-query';
import { plannedLittersService } from '@/services/planned-litters';

interface DashboardLayoutProps {
  user: User | null;
  activePregnancies: ActivePregnancy[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies = []
}) => {
  const [isDataReady, setIsDataReady] = useState(false);
  const [remindersDialogOpen, setRemindersDialogOpen] = useState(false);
  
  // Get reminders data
  const {
    reminders,
    isLoading: remindersLoading,
    hasError: remindersError,
    handleMarkComplete
  } = useBreedingReminders();
  
  // Get calendar events data
  const eventsData = useCalendarEvents();
  
  // Get planned litters count
  const { data: plannedLitters = [] } = useQuery({
    queryKey: ['planned-litters-dashboard'],
    queryFn: () => plannedLittersService.loadPlannedLitters(),
    enabled: !!user,
  });
  
  // Function to open reminders dialog
  const handleOpenRemindersDialog = () => {
    console.log('Opening reminders dialog from dashboard hero');
    setRemindersDialogOpen(true);
  };
  
  // Set data ready state once all data is loaded
  useEffect(() => {
    if (!remindersLoading && !eventsData.isLoading) {
      setIsDataReady(true);
    }
  }, [remindersLoading, eventsData.isLoading]);
  
  return (
    <div className="container max-w-7xl mx-auto px-4 pt-8">
      <DashboardHero 
        user={user}
        reminderCount={reminders.filter(r => !r.isCompleted).length}
        plannedLittersCount={plannedLitters.length}
        activePregnanciesCount={activePregnancies.length}
        recentLittersCount={0} // This would need to be calculated or fetched
        onRemindersClick={handleOpenRemindersDialog}
      />
      
      {activePregnancies.length > 0 && (
        <ActivePregnanciesSection 
          activePregnancies={activePregnancies} 
        />
      )}
      
      <DashboardContent 
        isDataReady={isDataReady}
        calendarProps={eventsData}
        remindersProps={{
          reminders,
          isLoading: remindersLoading,
          hasError: remindersError,
          handleMarkComplete
        }}
      />
    </div>
  );
};

export default DashboardLayout;
