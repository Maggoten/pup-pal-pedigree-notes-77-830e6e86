
import { useState } from 'react';
import { CalendarEvent, AddEventFormValues } from '../types';
import { toast } from '@/components/ui/use-toast';
import { useCalendarContext } from '../context/CalendarContext';

interface UseCalendarDialogsProps {
  onAddEvent: (data: AddEventFormValues) => Promise<boolean>;
  onEditEvent?: (eventId: string, data: AddEventFormValues) => Promise<boolean>;
  onDeleteEvent: (eventId: string) => Promise<boolean>;
}

export const useCalendarDialogs = ({ 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent 
}: UseCalendarDialogsProps) => {
  const { 
    isLoading, 
    setIsLoading, 
    setIsAddDialogOpen, 
    setIsEditDialogOpen,
    selectedEvent,
    setSelectedEvent
  } = useCalendarContext();
  
  const handleAddEvent = async (data: AddEventFormValues) => {
    setIsLoading(true);
    try {
      const success = await onAddEvent(data);
      if (success) {
        setIsAddDialogOpen(false);
      }
      return success;
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditEvent = async (data: AddEventFormValues) => {
    if (selectedEvent && onEditEvent) {
      setIsLoading(true);
      try {
        const success = await onEditEvent(selectedEvent.id, data);
        if (success) {
          setIsEditDialogOpen(false);
          setSelectedEvent(null);
        }
        return success;
      } catch (error) {
        console.error('Error editing event:', error);
        toast({
          title: "Error",
          description: "Failed to edit event. Please try again.",
          variant: "destructive"
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return false;
  };
  
  const handleDeleteSelectedEvent = async () => {
    if (selectedEvent) {
      setIsLoading(true);
      try {
        const success = await onDeleteEvent(selectedEvent.id);
        if (success) {
          setIsEditDialogOpen(false);
          setSelectedEvent(null);
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return {
    isLoading,
    handleAddEvent,
    handleEditEvent,
    handleDeleteSelectedEvent
  };
};
