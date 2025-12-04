import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';

interface WeeklyPhotoUploaderProps {
  weekNumber: number;
  puppy: Puppy;
  open: boolean;
  onClose: () => void;
  onUpload: (weekNumber: number, file: File, notes?: string, weight?: number, height?: number) => Promise<void>;
}

const WeeklyPhotoUploader: React.FC<WeeklyPhotoUploaderProps> = ({
  weekNumber,
  puppy,
  open,
  onClose,
  onUpload
}) => {
  const { t } = useTranslation('litters');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: t('puppies.weeklyPhotos.dialog.invalidFileType'),
          description: t('puppies.weeklyPhotos.dialog.onlyImagesAllowed'),
          variant: "destructive"
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const weightNum = weight ? parseFloat(weight) : undefined;
      const heightNum = height ? parseFloat(height) : undefined;
      
      await onUpload(weekNumber, selectedFile, notes || undefined, weightNum, heightNum);
      
      toast({
        title: t('puppies.weeklyPhotos.dialog.uploadSuccess'),
        description: t('puppies.weeklyPhotos.dialog.uploadSuccessDescription', { week: weekNumber })
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: t('puppies.weeklyPhotos.dialog.uploadFailed'),
        description: t('puppies.weeklyPhotos.dialog.uploadFailedDescription'),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    handleRemoveFile();
    setNotes('');
    setWeight('');
    setHeight('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('puppies.weeklyPhotos.dialog.title', { week: weekNumber })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>{t('puppies.weeklyPhotos.dialog.photoLabel')}</Label>
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              >
                <Camera className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('puppies.weeklyPhotos.dialog.clickToSelect')}
                </p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <img
                      src={previewUrl!}
                      alt={t('puppies.weeklyPhotos.dialog.preview')}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedFile.name}
                  </p>
                </CardContent>
              </Card>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">{t('puppies.weeklyPhotos.dialog.weightLabel')}</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">{t('puppies.weeklyPhotos.dialog.heightLabel')}</Label>
              <Input
                id="height"
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
            <Label htmlFor="notes">{t('puppies.weeklyPhotos.dialog.notesLabel')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('puppies.weeklyPhotos.dialog.notesPlaceholder')}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t('puppies.weeklyPhotos.dialog.cancel')}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? t('puppies.weeklyPhotos.dialog.uploading') : t('puppies.weeklyPhotos.dialog.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyPhotoUploader;