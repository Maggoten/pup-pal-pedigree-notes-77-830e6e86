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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, AlertCircle, Filter, PawPrint } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UpcomingHeat } from '@/types/reminders';
import { formatDateWithLocale } from '@/utils/localizedDateFormat';
import { addDays, differenceInDays, isPast, isToday } from 'date-fns';

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
  const { t, i18n } = useTranslation('home');
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

  const formatHeatDate = (date: Date): string => {
    const daysRemaining = differenceInDays(date, new Date());
    
    if (isToday(date)) {
      return t('upcomingHeats.today');
    } else if (daysRemaining < 0) {
      return t('upcomingHeats.overdue', { days: Math.abs(daysRemaining) });
    } else {
      return t('upcomingHeats.days', { days: daysRemaining });
    }
  };

  const formatDetailedDate = (date: Date): string => {
    return formatDateWithLocale(date, 'd MMM yyyy', i18n.language);
  };

  const getStatusVariant = (date: Date) => {
    if (isPast(date) && !isToday(date)) return 'destructive';
    if (isToday(date)) return 'default';
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil <= 7) return 'secondary';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-warmgreen-600" />
            <span>{t('upcomingHeats.title')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('upcomingHeats.description')} ({heats.length} {heats.length === 1 ? 'löp' : 'löp'})
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
                  ? t('upcomingHeats.empty.description')
                  : (i18n.language === 'sv' 
                      ? 'Inga löp i den valda tidsperioden' 
                      : 'No heats in the selected time period'
                    )
                }
              </p>
            </div>
          ) : (
            filteredHeats.map((heat) => {
              const daysRemaining = differenceInDays(heat.date, new Date());
              const isOverdue = daysRemaining < 0;
              
              return (
                <div
                  key={`${heat.dogId}-${heat.date.toISOString()}`}
                  className="flex items-center gap-3 p-4 rounded-lg bg-greige-50 border border-greige-200 hover:bg-greige-100 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={heat.dogImageUrl} 
                      alt={heat.dogName} 
                      className="object-cover" 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <PawPrint className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-brown-800 truncate">{heat.dogName}</h4>
                      {isOverdue && <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                    </div>
                    
                    <div className="text-sm text-brown-600 space-y-1">
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
                  
                  <Badge variant={getStatusVariant(heat.date)} className="text-xs">
                    {formatHeatDate(heat.date)}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};