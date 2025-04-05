
import React from 'react';
import StatsCards from './StatsCards';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface DashboardHeroProps {
  username: string;
  activePregnancies: ActivePregnancy[];
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ username, activePregnancies }) => {
  return (
    <div className="mb-8 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Your Breeding Program at a Glance</h1>
      <p className="text-muted-foreground mb-4">
        Track pregnancies, plan litters, and manage your breeding program all in one place.
      </p>
      <StatsCards activePregnancies={activePregnancies} />
    </div>
  );
};

export default DashboardHero;
