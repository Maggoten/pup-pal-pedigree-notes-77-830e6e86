
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Puppy } from '@/types/breeding';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import PuppyNotesHistoryDialog from './PuppyNotesHistoryDialog';

interface PuppyNotesTabProps {
  puppy: Puppy;
  note: string;
  setNote: (value: string) => void;
  selectedDate: Date;
  selectedTime: string;
  onAddNote: () => void;
}

const PuppyNotesTab: React.FC<PuppyNotesTabProps> = ({
  puppy,
  note,
  setNote,
  selectedDate,
  selectedTime,
  onAddNote
}) => {
  const safeNotes = puppy.notes ?? [];
  const [showAllNotes, setShowAllNotes] = useState(false);
  const hasNotes = puppy.notes && puppy.notes.length > 0;

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
          <h3 className="text-sm font-medium">Recent Notes</h3>
          {hasNotes && safeNotes.length > 5 && (
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
            {safeNotes.slice(0, 5).map((note, index) => (
              <div key={index} className="border rounded-md p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  {format(new Date(note.date), "PPP p")}
                </div>
                <p className="text-sm">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md text-muted-foreground">
            No notes yet
          </div>
        )}
      </div>
    </div>
  );
};

export default PuppyNotesTab;
