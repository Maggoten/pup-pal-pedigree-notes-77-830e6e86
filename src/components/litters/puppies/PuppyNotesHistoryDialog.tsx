
import React from 'react';
import { 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Puppy, PuppyNote } from '@/types/breeding';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PuppyNotesHistoryDialogProps {
  puppy: Puppy;
  onClose: () => void;
}

const PuppyNotesHistoryDialog: React.FC<PuppyNotesHistoryDialogProps> = ({
  puppy,
  onClose
}) => {
  const { t } = useTranslation('litters');
  // If no notes array or it's empty, show appropriate message
  const hasNotes = puppy.notes && puppy.notes.length > 0;

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('notesHistory.title', { name: puppy.name })}
        </DialogTitle>
        <DialogDescription>
          {t('notesHistory.description')}
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        {hasNotes ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {puppy.notes.map((note: PuppyNote, index: number) => (
                <div key={index} className="border rounded-md p-4 bg-background">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium">
                      {format(new Date(note.date), "PPPP")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(note.date), "p")}
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-[200px] border rounded-md p-6">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('notesHistory.noNotesYet')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('notesHistory.noNotesDescription')}
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={onClose}>{t('puppies.actions.close')}</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PuppyNotesHistoryDialog;
