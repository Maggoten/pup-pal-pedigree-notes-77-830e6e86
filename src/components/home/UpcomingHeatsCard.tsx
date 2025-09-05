import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, PawPrint } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUpcomingHeats } from '@/hooks/useUpcomingHeats';
import { useDogs } from '@/hooks/dogs';
import { UpcomingHeatsModal } from './UpcomingHeatsModal';
import { formatDateWithLocale } from '@/utils/localizedDateFormat';
import { differenceInDays } from 'date-fns';

const UpcomingHeatsCard: React.FC = () => {
  const { t, i18n } = useTranslation('home');
  const [showModal, setShowModal] = useState(false);
  const { upcomingHeats, loading } = useUpcomingHeats();
  const { dogs } = useDogs();
  const navigate = useNavigate();

  // Show loading state if data is being fetched
  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Don't render if there are no female dogs
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  if (femaleDogs.length === 0) {
    return null;
  }

  const formatDetailedDate = (date: Date): string => {
    return formatDateWithLocale(date, 'd MMM yyyy', i18n.language);
  };

  const calculateDaysRemaining = (date: Date): number => {
    return differenceInDays(date, new Date());
  };

  const getStatusColor = (days: number): string => {
    if (days < 0) return 'bg-destructive'; // overdue
    if (days < 30) return 'bg-red-500'; // red
    if (days <= 60) return 'bg-amber-400'; // yellow  
    return 'bg-warmgreen-500'; // green
  };

  const handleHeatClick = (dogId: string) => {
    navigate(`/my-dogs/${dogId}/heat-tracking`);
  };

  // Show first 3 upcoming heats
  const displayHeats = upcomingHeats.slice(0, 3);
  const hasMoreHeats = upcomingHeats.length > 3;

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('upcomingHeats.title')}</CardTitle>
          <CardDescription className="text-sm">
            {t('upcomingHeats.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayHeats.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              {t('upcomingHeats.empty.title')}
            </p>
          ) : (
            <>
              {displayHeats.map((heat) => {
                const daysRemaining = calculateDaysRemaining(heat.date);
                const isOverdue = daysRemaining < 0;
                
                return (
                  <div 
                    key={heat.dogId} 
                    className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded-md px-2 -mx-2 transition-colors"
                    onClick={() => handleHeatClick(heat.dogId)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={heat.dogImageUrl} 
                        alt={heat.dogName} 
                        className="object-cover" 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        <PawPrint className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-primary truncate">{heat.dogName}</span>
                        {isOverdue && <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />}
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span>
                            {t('upcomingHeats.nextHeat', {
                              date: formatDetailedDate(heat.date),
                              days: Math.abs(daysRemaining)
                            })}
                          </span>
                          {heat.source === 'predicted' && (
                            <span className="text-muted-foreground/70">
                              {t('upcomingHeats.predicted')}
                            </span>
                          )}
                        </div>
                        {heat.lastHeatDate && (
                          <div>
                            {t('upcomingHeats.lastHeat', {
                              date: formatDetailedDate(heat.lastHeatDate)
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div 
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(daysRemaining)}`}
                      title={
                        daysRemaining < 0 ? t('upcomingHeats.overdue', { days: Math.abs(daysRemaining) }) :
                        daysRemaining < 30 ? 'Mindre än 30 dagar' :
                        daysRemaining <= 60 ? '30-60 dagar' : 'Mer än 60 dagar'
                      }
                    />
                  </div>
                );
              })}
              
              {hasMoreHeats && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setShowModal(true)}
                >
                  {t('upcomingHeats.viewAll', { count: upcomingHeats.length })}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <UpcomingHeatsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        heats={upcomingHeats}
      />
    </>
  );
};

export default UpcomingHeatsCard;