
import React, { useMemo } from 'react';
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import DashboardHero from './DashboardHero';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { DogsProvider } from '@/context/DogsContext';
import PageLayout from '@/components/PageLayout';
import AddDogButton from '@/components/AddDogButton';
import BreedingStats from '@/components/BreedingStats';
import WeeklyTasks from '@/components/reminders/WeeklyTasks';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { addDays, subDays } from 'date-fns';

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
  
  return (
    <DogsProvider>
      <PageLayout 
        title="Breeding Journey Dashboard" 
        description={`Welcome back, ${username}! Here's an overview of your breeding program`}
      >
        <div className="space-y-6">
          <DashboardHero 
            username={username}
            reminders={remindersSummary}
            plannedLitters={plannedLittersData}
            activePregnancies={activePregnancies}
            recentLitters={recentLittersData}
          />
          
          {/* Updated dashboard content layout */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
            {/* Full-width calendar (spans all 12 columns) */}
            <div className="lg:col-span-12">
              <BreedingCalendar />
            </div>
            
            {/* Side-by-side reminders and stats */}
            <div className="lg:col-span-4">
              <div className="space-y-6">
                <BreedingReminders />
                <BreedingStats />
              </div>
            </div>
            
            {/* Weekly tasks take up more space */}
            <div className="lg:col-span-8">
              <WeeklyTasks reminders={reminders} onComplete={handleMarkComplete} />
            </div>
          </div>
        </div>
      </PageLayout>
        
      <AddDogButton onClick={onAddDogClick} />
    </DogsProvider>
  );
};

export default DashboardLayout;
