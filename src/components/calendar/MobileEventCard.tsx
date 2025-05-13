
import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { X, Edit, Trash2, BellRing, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileEventCardProps {
  event: CalendarEvent;
  colorClass: string;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const MobileEventCard: React.FC<MobileEventCardProps> = ({
  event,
  colorClass,
  onClose,
  onDelete,
  onEdit
}) => {
  // Check if this is a reminder event
  const isReminder = event.id.startsWith('reminder-');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xs rounded-lg bg-white shadow-lg overflow-hidden">
        <div className={cn("p-3 flex justify-between items-center", colorClass)}>
          <div className="flex items-center">
            {isReminder ? (
              <BellRing className="h-4 w-4 mr-2" />
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            <h3 className="font-medium text-sm">
              {isReminder ? "Reminder" : "Event"}
            </h3>
          </div>
          <button onClick={onClose} className="text-current opacity-80 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">{event.title}</h2>
          
          <div className="text-sm text-gray-500 mb-3">
            {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
            {event.time && <span> • {event.time}</span>}
          </div>
          
          {event.notes && (
            <div className="mb-4">
              <p className="text-sm">{event.notes}</p>
            </div>
          )}
          
          {event.dogName && (
            <div className="text-xs text-gray-500 mb-3">
              Related to: {event.dogName}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            
            {!isReminder && onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center"
                onClick={onEdit}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
            
            {!isReminder && onDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileEventCard;
