import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PuppyWeeklyPhoto } from '@/types/breeding';
import { toast } from '@/hooks/use-toast';

interface WeeklyPhotoEditorProps {
  photo: PuppyWeeklyPhoto;
  open: boolean;
  onClose: () => void;
  onUpdate: (photoId: string, updates: { notes?: string; weight?: number; height?: number; date_taken?: string; new_image?: File }) => Promise<void>;
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
  const [dateTaken, setDateTaken] = useState<Date | undefined>();
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form with existing data when photo changes
  useEffect(() => {
    if (photo) {
      setNotes(photo.notes || '');
      setWeight(photo.weight ? photo.weight.toString() : '');
      setHeight(photo.height ? photo.height.toString() : '');
      setDateTaken(photo.date_taken ? new Date(photo.date_taken) : undefined);
      setPreviewUrl(photo.image_url);
      setNewImage(null);
    }
  }, [photo]);

  // Handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const weightNum = weight ? parseFloat(weight) : undefined;
      const heightNum = height ? parseFloat(height) : undefined;
      
      await onUpdate(photo.id, {
        notes: notes || undefined,
        weight: weightNum,
        height: heightNum,
        date_taken: dateTaken?.toISOString(),
        new_image: newImage || undefined
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
    // Reset form to original values and cleanup
    if (photo) {
      setNotes(photo.notes || '');
      setWeight(photo.weight ? photo.weight.toString() : '');
      setHeight(photo.height ? photo.height.toString() : '');
      setDateTaken(photo.date_taken ? new Date(photo.date_taken) : undefined);
      setPreviewUrl(photo.image_url);
      setNewImage(null);
      
      // Cleanup preview URL if it was created from file
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
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
          {/* Photo Preview and Upload */}
          <div className="space-y-2">
            <Label>Foto</Label>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted relative group">
              <img
                src={previewUrl}
                alt={`Vecka ${photo?.week_number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" variant="secondary" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Byt bild
                    </span>
                  </Button>
                </label>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {newImage && (
              <p className="text-sm text-muted-foreground">
                Ny bild vald: {newImage.name}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Datum för mätning</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTaken && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTaken ? format(dateTaken, 'yyyy-MM-dd') : <span>Välj datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTaken}
                  onSelect={setDateTaken}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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