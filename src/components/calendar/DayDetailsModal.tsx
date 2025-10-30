import { format } from 'date-fns';
import { X, Heart, Star, Cake } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CalendarEvent } from './types';
import { getDogPregnancyColor } from '@/utils/dogColorUtils';
import { getEventCategory } from '@/utils/eventCategories';
import { calculateDaysPregnant, calculateDueDate, normalizeDate } from '@/utils/pregnancyCalculations';

interface DayDetailsModalProps {
  date: Date | null;
  events: CalendarEvent[];
  onClose: () => void;
}

export const DayDetailsModal = ({
  date,
  events,
  onClose,
}: DayDetailsModalProps) => {
  if (!date) return null;
  
  // Group events by type
  const pregnancies = events.filter(e => e.type === 'pregnancy-period');
  const matings = events.filter(e => e.type === 'mating');
  const dueDates = events.filter(e => e.type === 'due-date');
  const birthdays = events.filter(e => e.type === 'birthday' || e.type === 'birthday-reminder');
  const healthEvents = events.filter(e => ['vaccination', 'health', 'vet-appointment'].includes(e.type || ''));
  const heatEvents = events.filter(e => ['heat', 'heat-start', 'ovulation-predicted', 'fertility-window'].includes(e.type || ''));
  const others = events.filter(e => 
    !['pregnancy-period', 'mating', 'due-date', 'birthday', 'birthday-reminder', 
      'vaccination', 'health', 'vet-appointment', 'heat', 'heat-start', 
      'ovulation-predicted', 'fertility-window'].includes(e.type || '')
  );
  
  return (
    <Sheet open={date !== null} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>{format(date, 'EEEE d MMMM yyyy')}</span>
            <button onClick={onClose} className="hover:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Mating events */}
          {matings.length > 0 && (
            <EventSection title="Parningar">
              {matings.map(event => (
                <EventItem key={event.id} event={event} icon={<Heart className="w-4 h-4" />} />
              ))}
            </EventSection>
          )}
          
          {/* Pregnancy events */}
          {pregnancies.length > 0 && (
            <EventSection title="Dräktigheter">
              {pregnancies.map(event => {
                const color = getDogPregnancyColor(event.dogId || '');
                const daysSinceMating = calculateDaysPregnant(normalizeDate(event.startDate));
                const dueDate = calculateDueDate(normalizeDate(event.startDate));
                
                return (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className={`${color.chip} text-white px-2 py-1 rounded flex items-center`}>
                      <Star className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.dogName}</p>
                      <p className="text-xs text-muted-foreground">
                        D+{daysSinceMating} • Due {format(dueDate, 'd MMM')} (±2d)
                      </p>
                      {event.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </EventSection>
          )}
          
          {/* Due date events */}
          {dueDates.length > 0 && (
            <EventSection title="Beräknade valpningar">
              {dueDates.map(event => (
                <EventItem key={event.id} event={event} icon={<Star className="w-4 h-4" />} />
              ))}
            </EventSection>
          )}
          
          {/* Birthday events */}
          {birthdays.length > 0 && (
            <EventSection title="Födelsedagar">
              {birthdays.map(event => (
                <EventItem key={event.id} event={event} icon={<Cake className="w-4 h-4" />} />
              ))}
            </EventSection>
          )}
          
          {/* Health events */}
          {healthEvents.length > 0 && (
            <EventSection title="Hälsa">
              {healthEvents.map(event => (
                <EventItem key={event.id} event={event} />
              ))}
            </EventSection>
          )}
          
          {/* Heat events */}
          {heatEvents.length > 0 && (
            <EventSection title="Brunst & Fertilitet">
              {heatEvents.map(event => (
                <EventItem key={event.id} event={event} />
              ))}
            </EventSection>
          )}
          
          {/* Other events */}
          {others.length > 0 && (
            <EventSection title="Övriga händelser">
              {others.map(event => (
                <EventItem key={event.id} event={event} />
              ))}
            </EventSection>
          )}
          
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Inga händelser denna dag
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper components
const EventSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="font-semibold text-sm mb-2">{title}</h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const EventItem = ({ 
  event, 
  icon, 
  color 
}: { 
  event: CalendarEvent; 
  icon?: React.ReactNode;
  color?: string;
}) => {
  const category = getEventCategory(event.type);
  const displayIcon = icon || category.icon;
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <span className={`${color ? `${color} text-white px-2 py-0.5 rounded flex items-center` : ''}`}>
        {displayIcon}
      </span>
      <div className="flex-1">
        <p className="font-medium text-sm">{event.title}</p>
        {event.dogName && (
          <p className="text-xs text-muted-foreground">{event.dogName}</p>
        )}
        {event.notes && (
          <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
        )}
        {event.time && (
          <p className="text-xs text-muted-foreground">⏰ {event.time}</p>
        )}
      </div>
    </div>
  );
};
