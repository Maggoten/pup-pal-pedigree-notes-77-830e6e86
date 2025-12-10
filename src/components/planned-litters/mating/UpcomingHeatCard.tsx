import React from 'react';
import { UpcomingHeat } from '@/types/reminders';
import { formatDistance, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, CalendarDays } from 'lucide-react';
import { HeatService } from '@/services/HeatService';
import { toast } from '@/components/ui/use-toast';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface UpcomingHeatCardProps {
  heat: UpcomingHeat;
  onHeatDeleted?: () => void;
}

const UpcomingHeatCard: React.FC<UpcomingHeatCardProps> = ({ heat, onHeatDeleted }) => {
  const { t } = useTranslation('plannedLitters');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const daysAway = formatDistance(heat.date, new Date(), { addSuffix: true });
  const dateFormatted = format(heat.date, 'MMM d, yyyy');

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      if (await HeatService.deleteHeatEntry(heat.dogId, heat.heatIndex)) {
        // Also delete any corresponding calendar events
        try {
          const heatEventId = `event-heat-${heat.dogId}-${heat.date.getTime()}`;
          const reminderEventId = `event-heat-reminder-${heat.dogId}-${heat.date.getTime()}`;
          
          // Use supabase to delete the events by matching type, dog_id and date
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
    <Card className="bg-white border-warmbeige-200 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">
              {heat.dogName}'s {t('labels.nextHeat')}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <CalendarDays className="h-3 w-3 text-rose-400" />
              <p className="text-xs text-muted-foreground">
                {dateFormatted}
              </p>
            </div>
            <Badge variant="secondary" className="mt-2 bg-rose-50 text-rose-700 hover:bg-rose-100">
              {daysAway}
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-6 w-6"
            title={t('upcomingHeat.deleteHeatRecord')}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingHeatCard;
