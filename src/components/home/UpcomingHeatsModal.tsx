import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UpcomingHeat } from '@/types/reminders';
import { formatDistanceToNow, isToday, isPast, addDays } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';

interface UpcomingHeatsModalProps {
  open: boolean;
  onClose: () => void;
  heats: UpcomingHeat[];
}

type FilterType = 'all' | 'next30' | 'next90';

export const UpcomingHeatsModal: React.FC<UpcomingHeatsModalProps> = ({
  open,
  onClose,
  heats
}) => {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');

  const filterHeats = (heats: UpcomingHeat[], filterType: FilterType): UpcomingHeat[] => {
    const today = new Date();
    
    switch (filterType) {
      case 'next30':
        const next30Days = addDays(today, 30);
        return heats.filter(heat => heat.date <= next30Days);
      case 'next90':
        const next90Days = addDays(today, 90);
        return heats.filter(heat => heat.date <= next90Days);
      default:
        return heats;
    }
  };

  const filteredHeats = filterHeats(heats, filter);

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

  const getStatusVariant = (date: Date) => {
    if (isPast(date) && !isToday(date)) return 'destructive';
    if (isToday(date)) return 'default';
    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) return 'secondary';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-warmgreen-600" />
            <span>{t('home:upcomingHeats.title')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('home:upcomingHeats.description')} ({heats.length} {heats.length === 1 ? 'löp' : 'löp'})
          </DialogDescription>
        </DialogHeader>

        {/* Filter Buttons */}
        <div className="flex space-x-2 pb-4 border-b border-greige-200">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            <Filter className="h-3 w-3 mr-1" />
            {i18n.language === 'sv' ? 'Alla' : 'All'}
          </Button>
          <Button
            variant={filter === 'next30' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('next30')}
            className="text-xs"
          >
            {i18n.language === 'sv' ? 'Nästa 30 dagar' : 'Next 30 days'}
          </Button>
          <Button
            variant={filter === 'next90' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('next90')}
            className="text-xs"
          >
            {i18n.language === 'sv' ? 'Nästa 90 dagar' : 'Next 90 days'}
          </Button>
        </div>

        {/* Heats List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredHeats.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-greige-400 mx-auto mb-2" />
              <p className="text-sm text-brown-600">
                {filter === 'all' 
                  ? t('home:upcomingHeats.empty.description')
                  : (i18n.language === 'sv' 
                      ? 'Inga löp i den valda tidsperioden' 
                      : 'No heats in the selected time period'
                    )
                }
              </p>
            </div>
          ) : (
            filteredHeats.map((heat) => {
              const isOverdue = isPast(heat.date) && !isToday(heat.date);
              const formattedDate = heat.date.toLocaleDateString(i18n.language === 'sv' ? 'sv-SE' : 'en-US');
              
              return (
                <div
                  key={`${heat.dogId}-${heat.date.toISOString()}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-greige-50 border border-greige-200 hover:bg-greige-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-brown-800">{heat.dogName}</h4>
                      <Badge variant={getStatusVariant(heat.date)} className="text-xs">
                        {formatHeatDate(heat.date)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-brown-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isOverdue && (
                    <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};