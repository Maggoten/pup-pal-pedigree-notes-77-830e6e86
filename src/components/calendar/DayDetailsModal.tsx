import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CalendarEvent } from './types';
import { getDogPregnancyColor } from '@/utils/dogColorUtils';

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
  const others = events.filter(e => 
    !['pregnancy-period', 'mating', 'due-date'].includes(e.type || '')
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
          {/* Legend */}
          <div className="flex gap-4 text-xs text-muted-foreground border-b pb-3">
            <span>♥ = Parning</span>
            <span>▬ = Dräktighet</span>
            <span>★ = Valpning</span>
          </div>
          
          {/* Mating events */}
          {matings.length > 0 && (
            <EventSection title="Parningar">
              {matings.map(event => (
                <EventItem key={event.id} event={event} icon="♥" />
              ))}
            </EventSection>
          )}
          
          {/* Pregnancy events */}
          {pregnancies.length > 0 && (
            <EventSection title="Dräktigheter">
              {pregnancies.map(event => {
                const color = getDogPregnancyColor(event.dogId || '');
                return (
                  <EventItem 
                    key={event.id} 
                    event={event} 
                    icon="▬" 
                    color={color.chip}
                  />
                );
              })}
            </EventSection>
          )}
          
          {/* Due date events */}
          {dueDates.length > 0 && (
            <EventSection title="Beräknade valpningar">
              {dueDates.map(event => (
                <EventItem key={event.id} event={event} icon="★" />
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
  icon?: string;
  color?: string;
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
    {icon && (
      <span className={`text-lg ${color ? `${color} text-white px-2 py-0.5 rounded` : ''}`}>
        {icon}
      </span>
    )}
    <div className="flex-1">
      <p className="font-medium text-sm">{event.title}</p>
      {event.dogName && (
        <p className="text-xs text-muted-foreground">{event.dogName}</p>
      )}
      {event.notes && (
        <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
      )}
    </div>
  </div>
);
