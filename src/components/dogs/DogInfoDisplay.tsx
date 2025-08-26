
import React from 'react';
import { format } from 'date-fns';
import { Dog as DogIcon } from 'lucide-react';
import { Dog } from '@/context/DogsContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useTranslation } from 'react-i18next';

interface DogInfoDisplayProps {
  dog: Dog;
}

const DogInfoDisplay: React.FC<DogInfoDisplayProps> = ({ dog }) => {
  const { t } = useTranslation('dogs');
  const { t: tLitters } = useTranslation('litters');

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('display.fields.photo')}</h3>
        <div className="w-full overflow-hidden rounded-lg border border-border">
          <AspectRatio ratio={1/1}>
            {dog.image ? (
              <img 
                src={dog.image} 
                alt={dog.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <DogIcon className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
          </AspectRatio>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.breed')}</h3>
            <p>{dog.breed}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.gender')}</h3>
            <p>{dog.gender === 'male' ? t('form.fields.gender.male') : t('form.fields.gender.female')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.dateOfBirth')}</h3>
            <p>{format(new Date(dog.dateOfBirth), 'PPP')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.color')}</h3>
            <p>{dog.color}</p>
          </div>
          
          {dog.registeredName && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">{tLitters('labels.registeredName')}</h3>
              <p>{dog.registeredName}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.registrationNumber')}</h3>
            <p>{dog.registrationNumber || t('display.details.notAvailable')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.dewormingDate')}</h3>
            <p>{dog.dewormingDate ? format(new Date(dog.dewormingDate), 'PPP') : t('display.details.notAvailable')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.vaccinationDate')}</h3>
            <p>{dog.vaccinationDate ? format(new Date(dog.vaccinationDate), 'PPP') : t('display.details.notAvailable')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.sterilizationDate')}</h3>
            <p>{dog.sterilizationDate ? format(new Date(dog.sterilizationDate), 'PPP') : t('display.details.notAvailable')}</p>
          </div>
        </div>
        
        {dog.gender === 'female' && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('display.fields.heatRecords')}</h3>
            {dog.heatHistory && dog.heatHistory.length > 0 ? (
              <div className="space-y-1">
                <div className="text-sm">{t('display.fields.previousHeatDates')}</div>
                <ul className="list-disc pl-5 space-y-1">
                  {dog.heatHistory.map((heat, index) => (
                    <li key={index} className="text-sm">
                      {format(new Date(heat.date), 'PPP')}
                    </li>
                  ))}
                </ul>
                {dog.heatInterval && (
                  <div className="text-sm mt-2">
                    <span className="font-medium">{t('display.fields.heatInterval')}</span> {dog.heatInterval} {t('display.fields.days')}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t('display.fields.noHeatRecords')}</p>
            )}
          </div>
        )}
        
        {dog.notes && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.notes')}</h3>
            <p className="whitespace-pre-wrap">{dog.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DogInfoDisplay;
