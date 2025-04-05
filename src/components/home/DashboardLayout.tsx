
import React from 'react';
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import DashboardHero from './DashboardHero';
import ActivePregnanciesSection from './ActivePregnanciesSection';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { DogsProvider } from '@/context/DogsContext';
import PageLayout from '@/components/PageLayout';
import AddDogButton from '@/components/AddDogButton';
import BreedingStats from '@/components/BreedingStats';

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
  
  return (
    <DogsProvider>
      <PageLayout 
        title="Breeding Journey Dashboard" 
        description={`Welcome back, ${username}! Here's an overview of your breeding program`}
      >
        <div className="space-y-8">
          <DashboardHero 
            username={username} 
            activePregnancies={activePregnancies}
          />
          
          {/* Main dashboard content */}
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <BreedingReminders />
                <BreedingStats />
              </div>
            </div>
            
            {/* Main content area */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <BreedingCalendar />
                {activePregnancies.length > 0 && 
                  <ActivePregnanciesSection pregnancies={activePregnancies} />
                }
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
        
      <AddDogButton onClick={onAddDogClick} />
    </DogsProvider>
  );
};

export default DashboardLayout;
