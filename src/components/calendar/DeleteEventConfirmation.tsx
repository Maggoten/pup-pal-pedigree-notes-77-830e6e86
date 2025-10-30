import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { EventDeletionHelpers } from '@/config/eventDeletionConfig';

interface DeleteEventConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventType: string;
  eventTitle: string;
}

const DeleteEventConfirmation: React.FC<DeleteEventConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  eventType,
  eventTitle
}) => {
  const confirmationData = EventDeletionHelpers.getConfirmationMessage(eventType, eventTitle);
  
  const getWarningColor = () => {
    switch (confirmationData.warningLevel) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background border-2 border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${getWarningColor()}`} />
            <AlertDialogTitle>{confirmationData.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground">
            {confirmationData.description}
          </AlertDialogDescription>
          
          {confirmationData.warningLevel === 'high' && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Varning: Detta kan inte ångras!
              </p>
              <p className="text-xs text-red-700 mt-1">
                Detta är permanent historisk data som inte kan återställas efter borttagning.
              </p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">
            Avbryt
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`${
              confirmationData.warningLevel === 'high'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-600 hover:bg-orange-700'
            } text-white`}
          >
            Ja, radera
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEventConfirmation;
