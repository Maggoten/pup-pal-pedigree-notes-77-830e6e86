import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentMating } from '@/types/reminders';
import { Heart, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface EnhancedRecentMatingsCardProps {
  recentMatings: RecentMating[];
}

const EnhancedRecentMatingsCard: React.FC<EnhancedRecentMatingsCardProps> = ({ recentMatings }) => {
  const { t } = useTranslation('plannedLitters');
  
  if (recentMatings.length === 0) {
    return (
      <Card className="dog-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-400" />
            {t('mating.recentMatings.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('mating.recentMatings.description')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dog-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-400" />
          {t('mating.recentMatings.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentMatings.map((mating, index) => (
            <div 
              key={`${mating.litterId}-${index}`} 
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-rose-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {mating.maleName} × {mating.femaleName}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {format(mating.date, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedRecentMatingsCard;