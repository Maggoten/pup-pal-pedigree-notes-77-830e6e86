
import React from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UpcomingHeatCard from './UpcomingHeatCard';
import { RecentMating } from '@/types/reminders';
import RecentMatingsCard from './RecentMatingsCard';
import MatingTipsCard from './MatingTipsCard';
import { useTranslation } from 'react-i18next';

interface MatingSectionProps {
  upcomingHeats: UpcomingHeat[];
  recentMatings: RecentMating[];
  onHeatDeleted?: () => void;
}

const MatingSection: React.FC<MatingSectionProps> = ({ upcomingHeats, recentMatings, onHeatDeleted }) => {
  const { t } = useTranslation('plannedLitters');

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-4">{t('matingSection.title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upcoming Heats Card */}
        <div>
          {upcomingHeats.length > 0 ? (
            <div className="grid gap-3">
              {upcomingHeats.map((heat, index) => (
                <UpcomingHeatCard key={`${heat.dogId}-${index}`} heat={heat} onHeatDeleted={onHeatDeleted} />
              ))}
            </div>
          ) : (
            <Card className="bg-white border-warmbeige-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{t('matingSection.upcomingHeats')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{t('matingSection.noUpcomingHeats')}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Recent Matings Card */}
        <div>
          <RecentMatingsCard recentMatings={recentMatings} />
        </div>
        
        {/* Mating Tips Card */}
        <div>
          <MatingTipsCard />
        </div>
      </div>
    </section>
  );
};

export default MatingSection;
