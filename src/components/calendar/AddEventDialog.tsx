
import React from 'react';
import EventForm, { AddEventFormValues } from './EventForm';
import { Dog } from '@/context/DogsContext';

interface AddEventDialogProps {
  dogs: Dog[];
  onSubmit: (data: AddEventFormValues) => Promise<boolean>;
  isLoading?: boolean;
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({ dogs, onSubmit, isLoading = false }) => {
  return (
    <div className="bg-cream-50 p-1">
      <EventForm dogs={dogs} onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};

export default AddEventDialog;
