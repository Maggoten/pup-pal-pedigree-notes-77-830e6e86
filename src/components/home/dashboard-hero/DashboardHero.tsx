
import React from 'react';
import MetricCardGrid from './MetricCardGrid';
import WelcomeHeader from './WelcomeHeader';
import DecorativePawprints from './DecorativePawprints';

interface DashboardHeroProps {
  username?: string;
  dogsCount: number;
  activePregnancies: number;
  plannedLitters: number;
  activeLitters: number;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  username,
  dogsCount,
  activePregnancies,
  plannedLitters,
  activeLitters
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-warmbeige-50 to-greige-100 rounded-xl p-6 md:p-8 shadow-sm">
      <DecorativePawprints />
      
      <div className="relative z-10">
        <WelcomeHeader username={username} />
        
        <MetricCardGrid 
          dogsCount={dogsCount} 
          activePregnancies={activePregnancies}
          plannedLitters={plannedLitters}
          activeLitters={activeLitters}
        />
      </div>
    </div>
  );
};

export default DashboardHero;
