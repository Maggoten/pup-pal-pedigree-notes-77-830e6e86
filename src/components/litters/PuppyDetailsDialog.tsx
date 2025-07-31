
import React, { useState, useEffect, useCallback } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Puppy, PuppyNote } from '@/types/breeding';
import PuppyDetailsForm from './puppies/PuppyDetailsForm';
import PuppyImageUploader from './puppies/PuppyImageUploader';
import { Trash2, MessageSquarePlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
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
  const { t, ready } = useTranslation('litters');
  const [imageUrl, setImageUrl] = useState<string>(puppy.imageUrl || '');
  const [displayName, setDisplayName] = useState<string>(puppy.name);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [newNote, setNewNote] = useState<string>('');
  
  // Update display name when puppy prop changes
  useEffect(() => {
    setDisplayName(puppy.name);
  }, [puppy.name]);

  // Update image URL when puppy prop changes  
  useEffect(() => {
    setImageUrl(puppy.imageUrl || '');
  }, [puppy.imageUrl]);
  
  const handleImageChange = useCallback((newImageUrl: string) => {
    setImageUrl(newImageUrl);
    
    // Update the puppy with the new image URL immediately
    const updatedPuppy = {
      ...puppy,
      imageUrl: newImageUrl
    };
    onUpdatePuppy(updatedPuppy);
  }, [puppy, onUpdatePuppy]);
  
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
    if (confirm(t('puppies.messages.deleteConfirmation', { name: displayName }))) {
      onDeletePuppy(puppy.id);
      if (onClose) onClose();
    }
  }, [puppy.id, displayName, onDeletePuppy, onClose, t]);

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
  }, [newNote, puppy, onUpdatePuppy]);

  // Add a handler for the close button
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-white border-2 border-warmbeige-400" onInteractOutside={handleClose} onEscapeKeyDown={handleClose}>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-warmgreen-800">{t('puppies.titles.puppyProfile')}</DialogTitle>
        <DialogDescription className="text-darkgray-700">
          {t('puppies.messages.viewAndManage', { name: displayName })}
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
          <TabsList className="grid grid-cols-3 mb-4 bg-warmbeige-200 p-1 rounded-lg">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md"
            >
              {t('puppies.titles.details')}
            </TabsTrigger>
            <TabsTrigger 
              value="growth" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md"
            >
              {t('puppies.titles.growth')}
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md rounded-md"
            >
              {t('puppies.titles.notes')}
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
              <h3 className="font-medium text-warmgreen-800">{t('puppies.titles.weightLog')}</h3>
              {puppy.weightLog && puppy.weightLog.length > 0 ? (
                <div className="border rounded-md overflow-hidden bg-white shadow">
                  <table className="w-full">
                    <thead className="bg-warmbeige-200">
                      <tr>
                        <th className="py-2 px-4 text-left text-warmgreen-800">{t('puppies.table.date')}</th>
                        <th className="py-2 px-4 text-left text-warmgreen-800">{t('puppies.table.weightKg')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...puppy.weightLog]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((log, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 px-4">{format(new Date(log.date), 'MMM d, yyyy')}</td>
                            <td className="py-2 px-4">{log.weight} {t('puppies.charts.units.kg')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground bg-warmbeige-50 p-3 rounded-md">{t('puppies.messages.noWeightRecords')}</p>
              )}

              <h3 className="font-medium text-warmgreen-800">{t('puppies.titles.heightLog')}</h3>
              {puppy.heightLog && puppy.heightLog.length > 0 ? (
                <div className="border rounded-md overflow-hidden bg-white shadow">
                  <table className="w-full">
                    <thead className="bg-warmbeige-200">
                      <tr>
                        <th className="py-2 px-4 text-left text-warmgreen-800">{t('puppies.table.date')}</th>
                        <th className="py-2 px-4 text-left text-warmgreen-800">{t('puppies.table.heightCm')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...puppy.heightLog]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((log, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 px-4">{format(new Date(log.date), 'MMM d, yyyy')}</td>
                            <td className="py-2 px-4">{log.height} {t('puppies.charts.units.cm')}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground bg-warmbeige-50 p-3 rounded-md">{t('puppies.messages.noHeightRecords')}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-warmgreen-800">{t('puppies.titles.notes')}</h3>
              
              <div className="flex space-x-2">
                <Textarea 
                  placeholder={t('puppies.placeholders.note')}
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
                  {t('puppies.actions.addNote')}
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
                <p className="text-muted-foreground bg-warmbeige-50 p-3 rounded-md mt-2">{t('puppies.messages.noNotesYet')}</p>
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
          {t('puppies.actions.deletePuppy')}
        </Button>
        <div>
          {activeTab === 'details' && (
            <DialogClose asChild>
              <Button 
                type="submit" 
                form="puppy-form" 
                className="bg-warmgreen-600 hover:bg-warmgreen-700"
              >
                {t('puppies.actions.saveChanges')}
              </Button>
            </DialogClose>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default React.memo(PuppyDetailsDialog);
