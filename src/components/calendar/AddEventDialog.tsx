
import React from 'react';
import EventForm, { AddEventFormValues } from './EventForm';
import { Dog } from '@/context/DogsContext';

interface AddEventDialogProps {
  dogs: Dog[];
  onSubmit: (data: AddEventFormValues) => void;
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({ dogs, onSubmit }) => {
  return (
    <div className="bg-cream-50 p-1">
      <EventForm dogs={dogs} onSubmit={onSubmit} />
    </div>
  );
};

export default AddEventDialog;
