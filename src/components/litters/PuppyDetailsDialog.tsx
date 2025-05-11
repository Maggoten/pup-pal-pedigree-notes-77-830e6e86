import React, { useState, useEffect, useCallback } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Puppy, PuppyNote } from '@/hooks/image-upload/types';
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
    if (onClose) onClose();
  }, [imageUrl, onUpdatePuppy, onClose]);

  const handleDelete = useCallback(() => {
    if (confirm(`Do you want to delete "${displayName}"?`)) {
      onDeletePuppy(puppy.id);
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
    if (onClose) onClose(); // Close dialog after adding a note
  }, [newNote, puppy, onUpdatePuppy, onClose]);

  // Add a handler for the close button
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-white border-2 border-warmbeige-400" onInteractOutside={handleClose} onEscapeKeyDown={handleClose}>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-warmgreen-800">Puppy Profile</DialogTitle>
        <DialogDescription className="text-darkgray-700">
          View and manage information for {displayName}.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Profile Image Section */}
        <div className="flex justify-center mb-4">
          <div className="w-40 h-40">
            <PuppyImageUploader 
              puppyName={displayName}
              puppyId={puppy.id}
              litterId={puppy.litter_id}
              currentImage={imageUrl}
              onImageChange={handleImageChange}
              large={true}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 bg-warmbeige-200 p-1 rounded-lg">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="growth" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md"
            >
              Growth
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md"
            >
              Notes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <PuppyDetailsForm 
              puppy={{...puppy, imageUrl}} 
              onSubmit={handleSubmit} 
            />
          </TabsContent>
          
          <TabsContent value="growth" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-warmgreen-800">Weight Log</h3>
              {puppy.weightLog && puppy.weightLog.length > 0 ? (
                <div className="border rounded-md overflow-hidden bg-white shadow">
                  <table className="w-full">
                    <thead className="bg-warmbeige-200">
                      <tr>
                        <th className="py-2 px-4 text-left text-warmgreen-800">Date</th>
                        <th className="py-2 px-4 text-left text-warmgreen-800">Weight (kg)</th>
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
                <p className="text-muted-foreground bg-warmbeige-50 p-3 rounded-md">No weight records yet.</p>
              )}

              <h3 className="font-medium text-warmgreen-800">Height Log</h3>
              {puppy.heightLog && puppy.heightLog.length > 0 ? (
                <div className="border rounded-md overflow-hidden bg-white shadow">
                  <table className="w-full">
                    <thead className="bg-warmbeige-200">
                      <tr>
                        <th className="py-2 px-4 text-left text-warmgreen-800">Date</th>
                        <th className="py-2 px-4 text-left text-warmgreen-800">Height (cm)</th>
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
                <p className="text-muted-foreground bg-warmbeige-50 p-3 rounded-md">No height records yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-warmgreen-800">Notes</h3>
              
              <div className="flex space-x-2">
                <Textarea 
                  placeholder="Add a new note about this puppy..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 border-2 border-warmbeige-300 focus:border-warmgreen-600"
                />
                <Button 
                  type="button" 
                  onClick={handleAddNote}
                  className="self-end bg-warmgreen-600 hover:bg-warmgreen-700"
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
                      <div key={idx} className="bg-white rounded-lg border-2 border-warmbeige-300 p-3 shadow-sm">
                        <div className="text-sm text-muted-foreground mb-1">
                          {format(new Date(note.date), 'MMM d, yyyy - h:mm a')}
                        </div>
                        <p>{note.content}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground bg-warmbeige-50 p-3 rounded-md mt-2">No notes yet.</p>
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
              <Button 
                type="submit" 
                form="puppy-form" 
                className="bg-warmgreen-600 hover:bg-warmgreen-700"
              >
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
