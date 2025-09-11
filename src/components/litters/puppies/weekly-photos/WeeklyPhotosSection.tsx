import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Camera, Plus, Weight, Ruler, Edit2 } from 'lucide-react';
import { Puppy, Litter, PuppyWeeklyPhoto } from '@/types/breeding';
import { useTranslation } from 'react-i18next';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import WeeklyPhotoUploader from './WeeklyPhotoUploader';
import WeeklyPhotoEditor from './WeeklyPhotoEditor';
import { useWeeklyPhotos } from '@/hooks/puppies/useWeeklyPhotos';

interface WeeklyPhotosSectionProps {
  puppy: Puppy;
  litter?: Litter;
  onUpdate: (puppy: Puppy) => void;
}

const WeeklyPhotosSection: React.FC<WeeklyPhotosSectionProps> = ({
  puppy,
  litter,
  onUpdate
}) => {
  const { t } = useTranslation('litters');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PuppyWeeklyPhoto | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  
  const {
    weeklyPhotos,
    isLoading,
    uploadWeeklyPhoto,
    deleteWeeklyPhoto,
    updateWeeklyPhoto
  } = useWeeklyPhotos(puppy.id);

  // Calculate current age in weeks
  const getCurrentWeek = () => {
    if (puppy.birthDateTime) {
      return differenceInWeeks(new Date(), parseISO(puppy.birthDateTime));
    }
    return litter ? differenceInWeeks(new Date(), parseISO(litter.dateOfBirth)) : 0;
  };

  const currentWeek = getCurrentWeek();
  const maxWeeks = 10; // Always show exactly weeks 1-10

  // Generate weeks array
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);

  // Get photo for specific week
  const getPhotoForWeek = (week: number): PuppyWeeklyPhoto | undefined => {
    return weeklyPhotos?.find(photo => photo.week_number === week);
  };

  const handleUploadPhoto = async (weekNumber: number, file: File, notes?: string, weight?: number, height?: number) => {
    try {
      await uploadWeeklyPhoto({
        puppy_id: puppy.id,
        week_number: weekNumber,
        file,
        notes,
        weight,
        height
      });
      setShowUploader(false);
      setSelectedWeek(null);
    } catch (error) {
      console.error('Failed to upload weekly photo:', error);
    }
  };

  const handleAddPhoto = (week: number) => {
    setSelectedWeek(week);
    setShowUploader(true);
  };

  const handleEditPhoto = (photo: PuppyWeeklyPhoto) => {
    setEditingPhoto(photo);
    setShowEditor(true);
  };

  const handleUpdatePhoto = async (photoId: string, updates: { 
    notes?: string; 
    weight?: number; 
    height?: number; 
    date_taken?: string; 
    new_image?: File 
  }) => {
    try {
      await updateWeeklyPhoto({ photoId, updates });
      setShowEditor(false);
      setEditingPhoto(null);
    } catch (error) {
      console.error('Failed to update weekly photo:', error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Week Grid */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
        {weeks.map((week) => {
          const photo = getPhotoForWeek(week);
          const isCurrentWeek = week === currentWeek;
          const isFutureWeek = week > currentWeek;
          
          return (
            <div key={week} className={`relative ${isCurrentWeek ? 'ring-2 ring-primary rounded-2xl' : ''}`}>
              {/* Week Header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Vecka {week}</span>
                {isCurrentWeek && (
                  <Badge variant="secondary" className="text-xs">
                    Aktuell
                  </Badge>
                )}
              </div>
              
              {photo ? (
                /* Photo Card */
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-md group">
                    <img
                      src={photo.image_url}
                      alt={`Vecka ${week}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Metadata Chips Overlay */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                      {photo.weight && (
                        <div className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm">
                          {photo.weight} kg
                        </div>
                      )}
                      <div className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
                        {format(parseISO(photo.date_taken), 'MMM d')}
                      </div>
                    </div>
                    
                    {/* Edit Button Overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm"
                        onClick={() => handleEditPhoto(photo)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Caption */}
                  {photo.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {photo.notes}
                    </p>
                  )}
                </div>
              ) : (
                /* Empty Week - Full Card Button */
                <button
                  className={`
                    w-full aspect-[4/3] rounded-2xl border-2 border-dashed 
                    flex flex-col items-center justify-center gap-2
                    transition-all duration-200 touch-manipulation
                    ${isFutureWeek 
                      ? 'border-muted-foreground/20 text-muted-foreground/50 cursor-not-allowed' 
                      : 'border-primary/30 text-muted-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-primary'
                    }
                  `}
                  onClick={() => handleAddPhoto(week)}
                  disabled={isFutureWeek}
                  aria-label={`Lägg till foto för vecka ${week}`}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-sm font-medium">Lägg till foto</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Dialog */}
      {showUploader && selectedWeek && (
        <WeeklyPhotoUploader
          weekNumber={selectedWeek}
          puppy={puppy}
          open={showUploader}
          onClose={() => {
            setShowUploader(false);
            setSelectedWeek(null);
          }}
          onUpload={handleUploadPhoto}
        />
      )}

      {/* Edit Dialog */}
      {showEditor && editingPhoto && (
        <WeeklyPhotoEditor
          photo={editingPhoto}
          open={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingPhoto(null);
          }}
          onUpdate={handleUpdatePhoto}
        />
      )}
    </div>
  );
};

export default WeeklyPhotosSection;