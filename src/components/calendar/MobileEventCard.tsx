import React from 'react';
import { CalendarEvent } from './types';
import { Button } from '@/components/ui/button';
import { X, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { getEventIcon } from '@/utils/eventIconUtils';

interface MobileEventCardProps {
  event: CalendarEvent;
  colorClass: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

const MobileEventCard: React.FC<MobileEventCardProps> = ({
  event,
  colorClass,
  onClose,
  onEdit,
  onDelete,
}) => {
  // Extract just the background class from colorClass string
  const bgClass = colorClass.split(' ').find(cls => cls.startsWith('bg-')) || '';
  const IconComponent = getEventIcon(event.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-warmbeige-50 rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-auto">
        <div className={`p-3 flex justify-between items-center ${bgClass}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {IconComponent && (
              <IconComponent className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            )}
            <h3 className="font-medium truncate">{event.title}</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <div className="text-sm font-medium text-darkgray-600">Date</div>
            <div>{format(event.date, 'PPPP')}</div>
          </div>
          
          {event.time && (
            <div>
              <div className="text-sm font-medium text-darkgray-600">Time</div>
              <div>{event.time}</div>
            </div>
          )}
          
          {event.dogName && (
            <div>
              <div className="text-sm font-medium text-darkgray-600">Dog</div>
              <div>{event.dogName}</div>
            </div>
          )}
          
          {event.notes && (
            <div>
              <div className="text-sm font-medium text-darkgray-600">Notes</div>
              <div className="whitespace-pre-line">{event.notes}</div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex items-center" onClick={onEdit}>
              <Edit className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
            {onDelete && (
              <Button variant="destructive" size="sm" className="flex items-center" onClick={onDelete}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
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
