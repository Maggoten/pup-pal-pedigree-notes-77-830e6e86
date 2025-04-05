
import React from 'react';
import { 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import EventForm, { AddEventFormValues } from './EventForm';
import { Dog } from '@/context/DogsContext';

interface AddEventDialogProps {
  dogs: Dog[];
  onSubmit: (data: AddEventFormValues) => void;
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({ dogs, onSubmit }) => {
  return (
    <DialogContent className="bg-cream-50">
      <DialogHeader>
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogDescription>
          Add a custom event to your breeding calendar
        </DialogDescription>
      </DialogHeader>
      
      <EventForm dogs={dogs} onSubmit={onSubmit} />
    </DialogContent>
  );
};

export default AddEventDialog;
