
import React from 'react';
import EventForm, { AddEventFormValues } from './EventForm';
import { Dog } from '@/context/DogsContext';
import { cn } from '@/lib/utils';

interface AddEventDialogProps {
  dogs: Dog[];
  onSubmit: (data: AddEventFormValues) => void;
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({ dogs, onSubmit }) => {
  // We're adding a custom wrapper with styles to ensure date and time fields align
  return (
    <div className={cn("bg-cream-50")}>
      <EventForm dogs={dogs} onSubmit={onSubmit} />
    </div>
  );
};

export default AddEventDialog;
