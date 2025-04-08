
import React, { useMemo } from 'react';
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { DogsProvider } from '@/context/DogsContext';
import PageLayout from '@/components/PageLayout';
import AddDogButton from '@/components/AddDogButton';
import BreedingStats from '@/components/BreedingStats';
import WeeklyTasks from '@/components/reminders/WeeklyTasks';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { addDays, subDays } from 'date-fns';
import StatsCards from './StatsCards';

interface DashboardLayoutProps {
  user: { email?: string } | null;
  activePregnancies: ActivePregnancy[];
  onAddDogClick: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  activePregnancies, 
  onAddDogClick 
}) => {
  const username = user?.email?.split('@')[0] || 'Breeder';
  const { reminders, handleMarkComplete } = useBreedingReminders();
  
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
  
  // Custom PageLayout that omits the WelcomeHeader since we're integrating it with the Hero
  return (
    <DogsProvider>
      <PageLayout 
        title="" 
        description=""
        showWelcomeHeader={false} // Don't show the standard WelcomeHeader
      >
        <div className="space-y-4">
          {/* Integrate DashboardHero directly in the content */}
          <div className="rounded-lg overflow-hidden border border-greige-300 sage-gradient relative animate-fade-in mt-4">
            <div className="px-6 pt-4 pb-1 border-b border-greige-200">
              <h2 className="text-2xl font-le-jour text-primary">Welcome back, {username}!</h2>
              <p className="text-sm font-glacial text-muted-foreground">Here's an overview of your breeding program</p>
            </div>
          
            <div className="p-4 md:p-6 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatsCards 
                  reminders={remindersSummary}
                  plannedLitters={plannedLittersData}
                  activePregnancies={activePregnancies}
                  recentLitters={recentLittersData}
                />
              </div>
            </div>
          </div>
          
          {/* Main dashboard content */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
            {/* Left side - Calendar and Weekly Tasks */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BreedingCalendar />
                <BreedingReminders />
              </div>
              
              <WeeklyTasks reminders={reminders} onComplete={handleMarkComplete} />
            </div>
            
            {/* Right side - Annual Breeding Stats */}
            <div className="lg:col-span-5">
              <BreedingStats />
            </div>
          </div>
        </div>
      </PageLayout>
        
      <AddDogButton onClick={onAddDogClick} />
    </DogsProvider>
  );
};

export default DashboardLayout;
