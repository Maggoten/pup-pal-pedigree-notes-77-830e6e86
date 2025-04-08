
import React from 'react';
import { Clock, Trash2, Edit } from 'lucide-react';
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
  const canDelete = event.type === 'custom' && onDelete;
  const canEdit = event.type === 'custom' && onEdit;
  
  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
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
        <DrawerFooter className="flex flex-col gap-2">
          {canEdit && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
              Edit Event
            </Button>
          )}
          {canDelete && (
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={onDelete}
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
