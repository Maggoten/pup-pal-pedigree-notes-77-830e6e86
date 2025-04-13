
import React, { useMemo } from 'react';
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import DashboardHero from './DashboardHero';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import PageLayout from '@/components/PageLayout';
import AddDogButton from '@/components/AddDogButton';
import BreedingStats from '@/components/BreedingStats';
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
  
  // We're not using the reminders directly in this component anymore
  // The BreedingReminders component will get them directly
  
  return (
    <PageLayout 
      title="" 
      description=""
    >
      <div className="space-y-4">
        <DashboardHero 
          username={username}
          reminders={{ count: 0, highPriority: 0 }} // This will be handled by the reminders component
          plannedLitters={plannedLittersData}
          activePregnancies={activePregnancies}
          recentLitters={recentLittersData}
        />
        
        {/* Main dashboard content - Updated layout */}
        <div className="space-y-6">
          {/* Top row: Calendar (2/3) and Reminders (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar taking 2/3 of the width */}
            <div className="lg:col-span-2">
              <BreedingCalendar />
            </div>
            
            {/* Reminders taking 1/3 of the width */}
            <div className="lg:col-span-1">
              <BreedingReminders />
            </div>
          </div>
          
          {/* Bottom row: Annual Breeding Stats (full width) */}
          <div>
            <BreedingStats />
          </div>
        </div>
      </div>
        
      <AddDogButton onClick={onAddDogClick} />
    </PageLayout>
  );
};

export default DashboardLayout;
