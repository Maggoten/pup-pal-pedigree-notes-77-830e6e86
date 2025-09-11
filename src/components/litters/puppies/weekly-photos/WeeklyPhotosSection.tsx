import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Camera, Plus, Weight, Ruler } from 'lucide-react';
import { Puppy, Litter, PuppyWeeklyPhoto } from '@/types/breeding';
import { useTranslation } from 'react-i18next';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import WeeklyPhotoUploader from './WeeklyPhotoUploader';
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
  const maxWeeks = Math.max(currentWeek + 1, 9); // Show up to current week + 1 or minimum 9 weeks

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

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Week Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {weeks.map((week) => {
          const photo = getPhotoForWeek(week);
          const isCurrentWeek = week === currentWeek;
          const isFutureWeek = week > currentWeek;
          
          return (
            <Card key={week} className={`relative ${isCurrentWeek ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Vecka {week}</span>
                  {isCurrentWeek && (
                    <Badge variant="secondary" className="text-xs">
                      Aktuell
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Photo */}
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {photo ? (
                    <img
                      src={photo.image_url}
                      alt={`Vecka ${week}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Photo Info */}
                {photo ? (
                  <div className="space-y-2">
                    {(photo.weight || photo.height) && (
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {photo.weight && (
                          <div className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            <span>{photo.weight} kg</span>
                          </div>
                        )}
                        {photo.height && (
                          <div className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            <span>{photo.height} cm</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {photo.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {photo.notes}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(photo.date_taken), 'MMM d, yyyy')}
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddPhoto(week)}
                    disabled={isFutureWeek}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Lägg till
                  </Button>
                )}
              </CardContent>
            </Card>
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
    </div>
  );
};

export default WeeklyPhotosSection;