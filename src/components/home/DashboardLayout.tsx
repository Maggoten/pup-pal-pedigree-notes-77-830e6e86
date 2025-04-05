
import React from 'react';
import BreedingCalendar from '@/components/BreedingCalendar';
import BreedingReminders from '@/components/BreedingReminders';
import DashboardHero from './DashboardHero';
import ActivePregnanciesSection from './ActivePregnanciesSection';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { DogsProvider } from '@/context/DogsContext';
import PageLayout from '@/components/PageLayout';
import AddDogButton from '@/components/AddDogButton';

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
        <DashboardHero 
          username={username} 
          activePregnancies={activePregnancies}
        />
        
        <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="h-full">
              <BreedingReminders />
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="space-y-6">
              <BreedingCalendar />
              {activePregnancies.length > 0 && <ActivePregnanciesSection pregnancies={activePregnancies} />}
            </div>
          </div>
        </div>
      </PageLayout>
        
      <AddDogButton onClick={onAddDogClick} />
    </DogsProvider>
  );
};

export default DashboardLayout;
