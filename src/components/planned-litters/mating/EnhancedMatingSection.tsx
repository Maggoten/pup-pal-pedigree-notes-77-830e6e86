import React from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedUpcomingHeatCard from './EnhancedUpcomingHeatCard';
import { RecentMating } from '@/types/reminders';
import EnhancedRecentMatingsCard from './EnhancedRecentMatingsCard';
import MatingTipsCard from './MatingTipsCard';
import { useTranslation } from 'react-i18next';
import { CalendarHeart } from 'lucide-react';

interface EnhancedMatingSectionProps {
  upcomingHeats: UpcomingHeat[];
  recentMatings: RecentMating[];
  onHeatDeleted?: () => void;
}

const EnhancedMatingSection: React.FC<EnhancedMatingSectionProps> = ({ 
  upcomingHeats, 
  recentMatings, 
  onHeatDeleted 
}) => {
  const { t } = useTranslation('plannedLitters');

  // Sort upcoming heats by date (soonest first)
  const sortedUpcomingHeats = [...upcomingHeats].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
          <CalendarHeart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-playfair font-semibold text-primary">
            {t('matingSection.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            Track upcoming heats, recent matings, and helpful breeding tips
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Heats Card */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-medium">
              {sortedUpcomingHeats.length}
            </span>
            {t('matingSection.upcomingHeats')}
          </h3>
          
          {sortedUpcomingHeats.length > 0 ? (
            <div className="space-y-3">
              {sortedUpcomingHeats.map((heat, index) => (
                <EnhancedUpcomingHeatCard 
                  key={`${heat.dogId}-${index}`} 
                  heat={heat} 
                  onHeatDeleted={onHeatDeleted} 
                />
              ))}
            </div>
          ) : (
            <Card className="dog-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t('matingSection.upcomingHeats')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('matingSection.noUpcomingHeats')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Recent Matings Card */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs flex items-center justify-center font-medium">
              {recentMatings.length}
            </span>
            Recent Matings
          </h3>
          <EnhancedRecentMatingsCard recentMatings={recentMatings} />
        </div>
        
        {/* Mating Tips Card */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Breeding Guide</h3>
          <MatingTipsCard />
        </div>
      </div>
    </section>
  );
};

export default EnhancedMatingSection;