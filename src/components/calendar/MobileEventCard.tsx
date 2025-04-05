
import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { CalendarEvent } from './types';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';

interface MobileEventCardProps {
  event: CalendarEvent;
  getEventColor: (type: string) => string;
  onDelete?: (event: CalendarEvent) => void;
}

const MobileEventCard: React.FC<MobileEventCardProps> = ({ 
  event, 
  getEventColor,
  onDelete 
}) => {
  const canDelete = event.type === 'custom' && onDelete;
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className={`p-1 rounded text-xs border ${getEventColor(event.type)} cursor-pointer`}>
          <div className="font-medium">{event.title}</div>
          {event.time && <div className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3 inline" /> {event.time}
          </div>}
          {event.dogName && <div>{event.dogName}</div>}
          {event.notes && <div className="text-xs italic mt-1 truncate">{event.notes}</div>}
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{event.title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-2 space-y-2">
          {event.time && <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> {event.time}
          </div>}
          {event.dogName && <div className="font-medium">Dog: {event.dogName}</div>}
          {event.notes && <div className="text-sm mt-2">{event.notes}</div>}
        </div>
        <DrawerFooter>
          {canDelete && (
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={() => onDelete && onDelete(event)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Event
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileEventCard;
