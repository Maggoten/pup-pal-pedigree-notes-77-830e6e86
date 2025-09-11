import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Circle, Calendar, Weight, Ruler, FileText } from 'lucide-react';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import { Puppy, Litter } from '@/types/breeding';
import { useTranslation } from 'react-i18next';

interface PuppyOverviewTabProps {
  puppy: Puppy;
  litter?: Litter;
}

const PuppyOverviewTab: React.FC<PuppyOverviewTabProps> = ({ puppy, litter }) => {
  const { t } = useTranslation('litters');

  const getLatestWeight = (puppy: Puppy) => {
    if (puppy.weightLog && puppy.weightLog.length > 0) {
      const sortedWeights = [...puppy.weightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedWeights[0].weight} kg`;
    }
    return puppy.currentWeight ? `${puppy.currentWeight} kg` : t('puppies.labels.notRecorded');
  };

  const getLatestHeight = (puppy: Puppy) => {
    if (puppy.heightLog && puppy.heightLog.length > 0) {
      const sortedHeights = [...puppy.heightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedHeights[0].height} cm`;
    }
    return t('puppies.labels.notRecorded');
  };

  return (
    <div className="space-y-8">
      {/* Main Info Grid - Photo and Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        {/* Profile Photo */}
        <div className="w-full max-w-[200px] mx-auto md:mx-0">
          <AspectRatio ratio={1/1} className="overflow-hidden rounded-lg border-2 border-warmbeige-200 shadow-sm">
            {puppy.imageUrl ? (
              <img 
                src={puppy.imageUrl} 
                alt={puppy.name} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="bg-warmgreen-100 text-warmgreen-800 font-medium text-6xl w-full h-full flex items-center justify-center">
                {puppy.name.charAt(0)}
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Basic Info */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Circle className={`h-5 w-5 ${puppy.gender === 'male' ? 'text-blue-500 fill-blue-500' : 'text-pink-500 fill-pink-500'}`} />
              <span className="font-medium">{puppy.gender === 'male' ? t('puppies.labels.male') : t('puppies.labels.female')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>
                {puppy.birthDateTime 
                  ? format(parseISO(puppy.birthDateTime), 'MMM d, yyyy')
                  : t('puppies.labels.birthDateNotSet')
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Weight className="h-5 w-5 text-muted-foreground" />
              <span>{getLatestWeight(puppy)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <span>{getLatestHeight(puppy)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-warmbeige-100 text-warmbeige-800">
              {puppy.color}
            </Badge>
            <Badge variant="secondary" className="bg-warmbeige-100 text-warmbeige-800">
              {puppy.breed}
            </Badge>
          </div>

          {/* Physical and Registration Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('puppies.titles.physicalDetails')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('puppies.labels.birthWeight')}:</span>
                  <span className="text-sm">{puppy.birthWeight ? `${puppy.birthWeight} kg` : t('puppies.labels.notRecorded')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('puppies.labels.currentWeight')}:</span>
                  <span className="text-sm">{getLatestWeight(puppy)}</span>
                </div>
                {puppy.markings && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('puppies.labels.markings')}:</span>
                    <span className="text-sm">{puppy.markings}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">{t('puppies.titles.registration')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('puppies.labels.microchip')}:</span>
                  <span className="text-sm">{puppy.microchip || t('puppies.labels.notSet')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('puppies.labels.collar')}:</span>
                  <span className="text-sm">{puppy.collar || t('puppies.labels.notSet')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('puppies.labels.breed')}:</span>
                  <span className="text-sm">{puppy.breed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          {(puppy.status === 'Reserved' || puppy.status === 'Sold') && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('puppies.titles.buyerInformation')}</h3>
              <p className="text-sm">{puppy.newOwner || t('puppies.labels.informationNotAvailable')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('puppies.titles.notesAndRecords')}
        </h3>
        {puppy.notes && puppy.notes.length > 0 ? (
          <div className="space-y-4">
            {puppy.notes
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((note, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-2">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(note.date), 'MMM d, yyyy - h:mm a')}
                  </p>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('puppies.messages.noNotesYet')}</p>
        )}
      </div>
    </div>
  );
};

export default PuppyOverviewTab;