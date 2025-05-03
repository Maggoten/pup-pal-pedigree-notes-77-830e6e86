
import React, { useState, useEffect, useCallback } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Puppy, PuppyNote } from '@/types/breeding';
import PuppyDetailsForm from './puppies/PuppyDetailsForm';
import PuppyImageUploader from './puppies/PuppyImageUploader';
import { Trash2, MessageSquarePlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

interface PuppyDetailsDialogProps {
  puppy: Puppy;
  onClose?: () => void;
  onUpdatePuppy: (updatedPuppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}

const PuppyDetailsDialog: React.FC<PuppyDetailsDialogProps> = ({ 
  puppy, 
  onClose, 
  onUpdatePuppy,
  onDeletePuppy
}) => {
  const [imageUrl, setImageUrl] = useState<string>(puppy.imageUrl || '');
  const [displayName, setDisplayName] = useState<string>(puppy.name);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [newNote, setNewNote] = useState<string>('');
  
  // Update display name when puppy prop changes
  useEffect(() => {
    setDisplayName(puppy.name);
  }, [puppy.name]);
  
  const handleImageChange = useCallback((newImageUrl: string) => {
    setImageUrl(newImageUrl);
  }, []);
  
  const handleSubmit = useCallback((updatedPuppyData: Puppy) => {
    // Clone the puppy data to avoid reference issues
    const updatedPuppy = {
      ...updatedPuppyData,
      imageUrl: imageUrl
    };
    
    onUpdatePuppy(updatedPuppy);
    toast({
      title: "Puppy Updated",
      description: `${updatedPuppy.name} has been updated successfully.`
    });
    if (onClose) onClose();
  }, [imageUrl, onUpdatePuppy, onClose]);

  const handleDelete = useCallback(() => {
    if (confirm(`Do you want to delete "${displayName}"?`)) {
      onDeletePuppy(puppy.id);
      toast({
        title: "Puppy Deleted",
        description: `${displayName} has been deleted from the litter.`,
        variant: "destructive"
      });
      if (onClose) onClose();
    }
  }, [puppy.id, displayName, onDeletePuppy, onClose]);

  const handleAddNote = useCallback(() => {
    if (!newNote.trim()) return;

    const now = new Date();
    const newNoteObj: PuppyNote = {
      date: now.toISOString(),
      content: newNote.trim()
    };

    const updatedPuppy = {
      ...puppy,
      notes: [...(puppy.notes || []), newNoteObj]
    };

    onUpdatePuppy(updatedPuppy);
    setNewNote('');
    toast({
      title: "Note Added",
      description: "Your note has been added successfully."
    });
    if (onClose) onClose(); // Close dialog after adding a note
  }, [newNote, puppy, onUpdatePuppy, onClose]);

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-greige-100 border-greige-300">
      <DialogHeader>
        <DialogTitle className="text-xl">Puppy Profile</DialogTitle>
        <DialogDescription>
          View and manage information for {displayName}.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Profile Image Section */}
        <div className="flex justify-center mb-4">
          <div className="w-40 h-40">
            <PuppyImageUploader 
              puppyName={displayName}
              currentImage={imageUrl}
              onImageChange={handleImageChange}
              large={true}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <PuppyDetailsForm 
              puppy={{...puppy, imageUrl}} 
              onSubmit={handleSubmit} 
            />
          </TabsContent>
          
          <TabsContent value="growth" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">Weight Log</h3>
              {puppy.weightLog && puppy.weightLog.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-2 px-4 text-left">Date</th>
                        <th className="py-2 px-4 text-left">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...puppy.weightLog]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((log, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 px-4">{format(new Date(log.date), 'MMM d, yyyy')}</td>
                            <td className="py-2 px-4">{log.weight} kg</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No weight records yet.</p>
              )}

              <h3 className="font-medium">Height Log</h3>
              {puppy.heightLog && puppy.heightLog.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-2 px-4 text-left">Date</th>
                        <th className="py-2 px-4 text-left">Height (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...puppy.heightLog]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((log, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 px-4">{format(new Date(log.date), 'MMM d, yyyy')}</td>
                            <td className="py-2 px-4">{log.height} cm</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No height records yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">Notes</h3>
              
              <div className="flex space-x-2">
                <Textarea 
                  placeholder="Add a new note about this puppy..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAddNote}
                  className="self-end"
                >
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {puppy.notes && puppy.notes.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {[...puppy.notes]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((note, idx) => (
                      <div key={idx} className="bg-white rounded-lg border p-3">
                        <div className="text-sm text-muted-foreground mb-1">
                          {format(new Date(note.date), 'MMM d, yyyy - h:mm a')}
                        </div>
                        <p>{note.content}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground mt-2">No notes yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter className="mt-6 flex items-center justify-between">
        <Button 
          type="button" 
          variant="destructive" 
          onClick={handleDelete}
          className="flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Puppy
        </Button>
        <div>
          {activeTab === 'details' && (
            <DialogClose asChild>
              <Button type="submit" form="puppy-form">
                Save Changes
              </Button>
            </DialogClose>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default React.memo(PuppyDetailsDialog);
