import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUpcomingHeats } from '@/hooks/useUpcomingHeats';
import { useDogs } from '@/hooks/dogs';
import { UpcomingHeatsModal } from './UpcomingHeatsModal';
import { formatDistanceToNow, isToday, isPast } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';

export const UpcomingHeatsCard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { dogs } = useDogs();
  const { upcomingHeats, loading } = useUpcomingHeats();
  const [modalOpen, setModalOpen] = useState(false);

  // Don't render if no female dogs or loading
  if (loading) {
    return (
      <Card className="bg-white border-greige-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-warmgreen-600" />
            <CardTitle className="text-lg text-brown-800">{t('home:upcomingHeats.title')}</CardTitle>
          </div>
          <p className="text-sm text-brown-600">{t('home:upcomingHeats.loading')}</p>
        </CardHeader>
      </Card>
    );
  }

  const femaleDogsCount = dogs.filter(dog => dog.gender === 'female').length;
  if (femaleDogsCount === 0) return null;

  const displayHeats = upcomingHeats.slice(0, 3);
  const hasMoreHeats = upcomingHeats.length > 3;

  const formatHeatDate = (date: Date) => {
    const locale = i18n.language === 'sv' ? sv : enUS;
    
    if (isToday(date)) {
      return t('home:upcomingHeats.today');
    }
    
    if (isPast(date)) {
      const days = Math.abs(Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
      return t('home:upcomingHeats.overdue', { days });
    }
    
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return t('home:upcomingHeats.days', { days });
  };

  return (
    <>
      <Card className="bg-white border-greige-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-warmgreen-600" />
            <CardTitle className="text-lg text-brown-800">{t('home:upcomingHeats.title')}</CardTitle>
          </div>
          <p className="text-sm text-brown-600">{t('home:upcomingHeats.description')}</p>
        </CardHeader>
        <CardContent>
          {upcomingHeats.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 text-greige-400 mx-auto mb-2" />
              <h4 className="text-sm font-medium text-brown-700 mb-1">
                {t('home:upcomingHeats.empty.title')}
              </h4>
              <p className="text-xs text-brown-500">
                {t('home:upcomingHeats.empty.description')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayHeats.map((heat) => {
                const isOverdue = isPast(heat.date) && !isToday(heat.date);
                
                return (
                  <div
                    key={`${heat.dogId}-${heat.date.toISOString()}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-greige-50 border border-greige-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-brown-800 text-sm">{heat.dogName}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-brown-500" />
                        <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-brown-500'}`}>
                          {formatHeatDate(heat.date)}
                        </span>
                      </div>
                    </div>
                    {isOverdue && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                );
              })}
              
              {hasMoreHeats && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="w-full mt-2 text-warmgreen-600 hover:text-warmgreen-700 hover:bg-warmgreen-50"
                >
                  {t('home:upcomingHeats.viewAll', { count: upcomingHeats.length })}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <UpcomingHeatsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        heats={upcomingHeats}
      />
    </>
  );
};