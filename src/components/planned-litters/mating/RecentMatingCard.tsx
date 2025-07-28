
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { RecentMating } from '@/types/reminders';
import { useTranslation } from 'react-i18next';

interface RecentMatingCardProps {
  mating: RecentMating;
}

const RecentMatingCard: React.FC<RecentMatingCardProps> = ({ mating }) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <Card className="bg-white hover:bg-warmbeige-50 transition-colors duration-200 cursor-pointer border-warmbeige-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-900">
          {mating.maleName} × {mating.femaleName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-gray-500">
          {t('recent.matedOn')} {format(new Date(mating.date), 'MMM d, yyyy')}
        </div>
        <div className="mt-2 text-xs">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {t('recent.id')}: {mating.litterId.substring(0, 8)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMatingCard;
