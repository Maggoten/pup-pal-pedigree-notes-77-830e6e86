
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentMating } from '@/types/reminders';
import RecentMatingCard from './RecentMatingCard';
import { useTranslation } from 'react-i18next';

interface RecentMatingsCardProps {
  recentMatings: RecentMating[];
}

const RecentMatingsCard: React.FC<RecentMatingsCardProps> = ({ recentMatings }) => {
  const { t } = useTranslation('plannedLitters');
  
  if (recentMatings.length === 0) {
    return (
      <Card className="bg-white border-warmbeige-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('mating.recentMatings.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{t('mating.recentMatings.description')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-warmbeige-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('mating.recentMatings.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {recentMatings.map((mating, index) => (
            <RecentMatingCard key={`${mating.litterId}-${index}`} mating={mating} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMatingsCard;
