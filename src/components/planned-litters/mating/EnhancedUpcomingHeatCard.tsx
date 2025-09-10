import React from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { formatDistance, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, CalendarDays, Image as ImageIcon } from 'lucide-react';
import { HeatService } from '@/services/HeatService';
import { toast } from '@/components/ui/use-toast';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useDogs } from '@/context/dogs/useDogs';

interface EnhancedUpcomingHeatCardProps {
  heat: UpcomingHeat;
  onHeatDeleted?: () => void;
}

const EnhancedUpcomingHeatCard: React.FC<EnhancedUpcomingHeatCardProps> = ({ heat, onHeatDeleted }) => {
  const { t } = useTranslation('plannedLitters');
  const { dogs } = useDogs();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const dog = dogs.find(d => d.id === heat.dogId);
  const daysAway = formatDistance(heat.date, new Date(), { addSuffix: true });
  const dateFormatted = format(heat.date, 'MMM d, yyyy');

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      if (await HeatService.deleteHeatEntry(heat.dogId, heat.heatIndex)) {
        toast({
          title: t('upcomingHeat.heatRecordDeleted'),
          description: t('upcomingHeat.heatRecordRemoved')
        });
        
        // Also delete any corresponding calendar events
        try {
          const { data: calendarEvents } = await supabase
            .from('calendar_events')
            .select('id')
            .eq('dog_id', heat.dogId)
            .in('type', ['heat', 'heat-reminder'])
            .eq('date', heat.date.toISOString());
            
          if (calendarEvents && calendarEvents.length > 0) {
            await supabase
              .from('calendar_events')
              .delete()
              .in('id', calendarEvents.map(event => event.id));
          }
        } catch (error) {
          console.error('Error removing calendar events for deleted heat:', error);
        }
        
        if (onHeatDeleted) {
          onHeatDeleted();
        }
      } else {
        toast({
          title: t('toasts.error.title'),
          description: t('upcomingHeat.couldNotDelete'),
          variant: "destructive"
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="dog-card overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Dog Avatar */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
              {dog?.image ? (
                <img 
                  src={dog.image} 
                  alt={heat.dogName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <Badge 
              className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4 bg-rose-400"
            >
              ♀
            </Badge>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {heat.dogName}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {t('labels.nextHeat')}
            </p>
            <div className="flex items-center gap-1 mb-2">
              <CalendarDays className="h-3 w-3 text-rose-400" />
              <p className="text-xs text-muted-foreground">
                {dateFormatted}
              </p>
            </div>
            <Badge variant="secondary" className="bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs">
              {daysAway}
            </Badge>
          </div>
          
          {/* Delete Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 flex-shrink-0"
            title={t('upcomingHeat.deleteHeatRecord')}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedUpcomingHeatCard;