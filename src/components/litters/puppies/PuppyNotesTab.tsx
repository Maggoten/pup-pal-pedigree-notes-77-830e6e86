
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Puppy } from '@/types/breeding';
import { format } from 'date-fns';
import { FileText, Trash2, Edit3, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import PuppyNotesHistoryDialog from './PuppyNotesHistoryDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface PuppyNotesTabProps {
  puppy: Puppy;
  note: string;
  setNote: (value: string) => void;
  selectedDate: Date;
  selectedTime: string;
  onAddNote: () => void;
  onDeleteNote: (index: number) => void;
  onEditNote: (index: number, newContent: string) => void;
}

const PuppyNotesTab: React.FC<PuppyNotesTabProps> = ({
  puppy,
  note,
  setNote,
  selectedDate,
  selectedTime,
  onAddNote,
  onDeleteNote,
  onEditNote
}) => {
  const { t } = useTranslation('litters');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number | null>(null);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  
  const hasNotes = puppy.notes && puppy.notes.length > 0;
  const notesToShow = hasNotes ? puppy.notes.slice(0, 5) : [];

  const handleDeleteClick = (index: number) => {
    setSelectedNoteIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedNoteIndex !== null) {
      onDeleteNote(selectedNoteIndex);
      toast({
        title: "Note Deleted",
        description: "The note has been removed."
      });
    }
    setDeleteDialogOpen(false);
    setSelectedNoteIndex(null);
  };

  const handleEditClick = (index: number, content: string) => {
    setEditingNoteIndex(index);
    setEditingContent(content);
  };

  const handleSaveEdit = () => {
    if (editingNoteIndex !== null) {
      onEditNote(editingNoteIndex, editingContent);
      toast({
        title: "Note Updated",
        description: "The note has been successfully updated."
      });
    }
    setEditingNoteIndex(null);
    setEditingContent('');
  };

  const handleCancelEdit = () => {
    setEditingNoteIndex(null);
    setEditingContent('');
  };

  const selectedNote = selectedNoteIndex !== null && hasNotes ? puppy.notes[selectedNoteIndex] : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="note">Add Note</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter a note about this puppy"
          rows={3}
        />
        <Button onClick={onAddNote} className="mt-2">Add Note</Button>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">{t('puppies.titles.recentNotes')}</h3>
          {hasNotes && puppy.notes.length > 5 && (
            <Dialog open={showAllNotes} onOpenChange={setShowAllNotes}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 h-7">
                  <FileText className="h-3.5 w-3.5" />
                  View All
                </Button>
              </DialogTrigger>
              <PuppyNotesHistoryDialog 
                puppy={puppy} 
                onClose={() => setShowAllNotes(false)} 
              />
            </Dialog>
          )}
        </div>
        
        {hasNotes ? (
          <div className="max-h-40 overflow-y-auto space-y-2">
            {notesToShow.map((note, index) => (
              <div key={index} className="border rounded-md p-3 relative group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(new Date(note.date), "PPP p")}
                    </div>
                    {editingNoteIndex === index ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="text-sm"
                          rows={3}
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="h-6 px-2 text-green-600 hover:bg-green-50"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="h-6 px-2 text-gray-600 hover:bg-gray-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm pr-16 whitespace-pre-wrap">{note.content}</p>
                    )}
                  </div>
                  {editingNoteIndex !== index && (
                    <div className="flex gap-1 absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(index, note.content)}
                        className="h-6 w-6 p-0 hover:bg-muted/50"
                      >
                        <Edit3 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(index)}
                        className="h-6 w-6 p-0 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md text-muted-foreground">
            No notes yet
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        itemDetails={selectedNote ? `Note from ${format(new Date(selectedNote.date), "PPP p")}: "${selectedNote.content.length > 50 ? selectedNote.content.substring(0, 50) + '...' : selectedNote.content}"` : undefined}
      />
    </div>
  );
};

export default PuppyNotesTab;
