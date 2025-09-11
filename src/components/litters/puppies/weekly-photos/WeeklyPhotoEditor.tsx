import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PuppyWeeklyPhoto } from '@/types/breeding';
import { toast } from '@/hooks/use-toast';

interface WeeklyPhotoEditorProps {
  photo: PuppyWeeklyPhoto;
  open: boolean;
  onClose: () => void;
  onUpdate: (photoId: string, updates: { notes?: string; weight?: number; height?: number }) => Promise<void>;
}

const WeeklyPhotoEditor: React.FC<WeeklyPhotoEditorProps> = ({
  photo,
  open,
  onClose,
  onUpdate
}) => {
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form with existing data when photo changes
  useEffect(() => {
    if (photo) {
      setNotes(photo.notes || '');
      setWeight(photo.weight ? photo.weight.toString() : '');
      setHeight(photo.height ? photo.height.toString() : '');
    }
  }, [photo]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const weightNum = weight ? parseFloat(weight) : undefined;
      const heightNum = height ? parseFloat(height) : undefined;
      
      await onUpdate(photo.id, {
        notes: notes || undefined,
        weight: weightNum,
        height: heightNum
      });
      
      toast({
        title: "Uppdatering lyckades",
        description: `Foto för vecka ${photo.week_number} har uppdaterats`
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: "Uppdatering misslyckades",
        description: "Kunde inte uppdatera fotot",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    // Reset form to original values
    if (photo) {
      setNotes(photo.notes || '');
      setWeight(photo.weight ? photo.weight.toString() : '');
      setHeight(photo.height ? photo.height.toString() : '');
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Redigera foto - Vecka {photo?.week_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Preview */}
          <div className="space-y-2">
            <Label>Foto</Label>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={photo?.image_url}
                alt={`Vecka ${photo?.week_number}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-weight">Vikt (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-height">Höjd (cm)</Label>
              <Input
                id="edit-height"
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Anteckningar</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Lägg till anteckningar om valpens utveckling denna vecka..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Avbryt
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
            >
              {isUpdating ? "Uppdaterar..." : "Spara ändringar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyPhotoEditor;