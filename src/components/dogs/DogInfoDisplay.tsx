import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Dog as DogIcon, Baby } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dog } from '@/context/DogsContext';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useTranslation } from 'react-i18next';
import { fetchPuppyOriginInfo } from '@/services/puppies/createDogFromPuppy';

interface DogInfoDisplayProps {
  dog: Dog;
}

interface OriginInfo {
  litterName: string;
  litterId: string;
  puppyId: string;
}

const DogInfoDisplay: React.FC<DogInfoDisplayProps> = ({
  dog
}) => {
  const { t } = useTranslation('dogs');
  const [originInfo, setOriginInfo] = useState<OriginInfo | null>(null);

  useEffect(() => {
    const loadOriginInfo = async () => {
      if (dog.source_puppy_id) {
        const info = await fetchPuppyOriginInfo(dog.source_puppy_id);
        setOriginInfo(info);
      }
    };
    loadOriginInfo();
  }, [dog.source_puppy_id]);
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      <div>
        
        <div className="w-full overflow-hidden rounded-lg border border-border">
          <AspectRatio ratio={1 / 1}>
            {dog.image ? <img src={dog.image} alt={dog.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-muted">
                <DogIcon className="h-12 w-12 text-muted-foreground/40" />
              </div>}
          </AspectRatio>
        </div>
      </div>
      
      <div className="space-y-4">
        {originInfo && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Baby className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('display.origin.label')}:</span>
            <Link 
              to={`/my-litters/${originInfo.litterId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {originInfo.litterName}
            </Link>
          </div>
        )}
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
          
          {dog.registeredName && <div>
              <h3 className="text-sm font-medium text-muted-foreground">{t('form.fields.registeredName.label')}</h3>
              <p>{dog.registeredName}</p>
            </div>}
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.registrationNumber')}</h3>
            <p>{dog.registrationNumber || t('display.details.notAvailable')}</p>
          </div>
          
        </div>
        
        {dog.notes && <div>
            <h3 className="text-sm font-medium text-muted-foreground">{t('display.fields.notes')}</h3>
            <p className="whitespace-pre-wrap">{dog.notes}</p>
          </div>}
      </div>
    </div>;
};
export default DogInfoDisplay;