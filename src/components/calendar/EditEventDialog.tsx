
import React from 'react';
import EventForm, { AddEventFormValues } from './EventForm';
import { Dog } from '@/context/DogsContext';
import { CalendarEvent } from './types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface EditEventDialogProps {
  event: CalendarEvent;
  dogs: Dog[];
  onSubmit: (data: AddEventFormValues) => Promise<boolean>;
  onDelete: () => void;
  isLoading?: boolean;
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({ event, dogs, onSubmit, onDelete, isLoading = false }) => {
  const canDelete = event.type === 'custom';
  
  // Convert the event to form values
  const defaultValues: AddEventFormValues = {
    title: event.title,
    date: event.date,
    time: event.time || '',
    notes: event.notes || '',
    dogId: event.dogId
  };
  
  return (
    <div className="bg-cream-50 p-1">
      <EventForm 
        dogs={dogs} 
        onSubmit={onSubmit} 
        defaultValues={defaultValues}
        submitLabel="Update Event"
        isLoading={isLoading}
      />
      
      {canDelete && (
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="destructive" 
            className="w-full flex items-center justify-center gap-2"
            onClick={onDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Delete Event
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditEventDialog;
