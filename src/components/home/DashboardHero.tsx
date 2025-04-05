
import React from 'react';
import StatsCards from './StatsCards';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface DashboardHeroProps {
  username: string;
  activePregnancies: ActivePregnancy[];
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ username, activePregnancies }) => {
  return (
    <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
      <StatsCards activePregnancies={activePregnancies} />
    </div>
  );
};

export default DashboardHero;
