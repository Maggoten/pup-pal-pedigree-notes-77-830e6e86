
import React, { useState } from 'react';
import EventForm, { AddEventFormValues } from './EventForm';
import { Dog } from '@/context/DogsContext';
import { CalendarEvent } from './types';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import HeatEventControl from './HeatEventControl';
import { useTranslation } from 'react-i18next';
import DeleteEventConfirmation from './DeleteEventConfirmation';
import { EventDeletionHelpers } from '@/config/eventDeletionConfig';

interface EditEventDialogProps {
  event: CalendarEvent;
  dogs: Dog[];
  onSubmit: (data: AddEventFormValues) => void;
  onDelete: () => void;
  onEventUpdate?: () => void;
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({ 
  event, 
  dogs, 
  onSubmit, 
  onDelete, 
  onEventUpdate 
}) => {
  const { t } = useTranslation('home');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Check if this event type can be deleted
  const canDelete = EventDeletionHelpers.canDelete(event.type || 'custom');
  const requiresConfirmation = EventDeletionHelpers.requiresConfirmation(event.type || 'custom');
  
  // Convert the event to form values
  const defaultValues: AddEventFormValues = {
    title: event.title,
    date: event.date,
    time: event.time || '',
    notes: event.notes || '',
    dogId: event.dogId
  };
  
  const handleDeleteClick = () => {
    if (requiresConfirmation) {
      // Show confirmation dialog for important events
      setShowDeleteConfirmation(true);
    } else {
      // Delete immediately for safe events
      onDelete();
    }
  };
  
  const handleConfirmDelete = () => {
    setShowDeleteConfirmation(false);
    onDelete();
  };
  
  return (
    <>
      <div className="bg-cream-50 p-1 space-y-4">
      {/* Heat Event Control for heat cycles */}
      {(event.type === 'heat' || event.type === 'heat-active') && onEventUpdate && (
        <HeatEventControl 
          event={event}
          dogs={dogs}
          onEventUpdate={onEventUpdate}
        />
      )}
      
      <EventForm 
        dogs={dogs} 
        onSubmit={onSubmit} 
        defaultValues={defaultValues}
        submitLabel={t('dialogs.editEvent.updateEvent')}
      />
      
      {canDelete && (
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="destructive" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            {t('dialogs.editEvent.deleteEvent')}
          </Button>
          
          {requiresConfirmation && (
            <p className="text-xs text-darkgray-500 text-center mt-2">
              ⚠️ Detta är viktig historisk data - du får bekräfta borttagningen
            </p>
          )}
        </div>
      )}
    </div>
    
    {/* Delete confirmation dialog */}
    <DeleteEventConfirmation
      isOpen={showDeleteConfirmation}
      onClose={() => setShowDeleteConfirmation(false)}
      onConfirm={handleConfirmDelete}
      eventType={event.type || 'custom'}
      eventTitle={event.title}
    />
    </>
  );
};

export default EditEventDialog;
