
import React, { memo, useCallback, useMemo } from 'react';
import { Dog } from '@/types/dogs';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useTranslation } from 'react-i18next';

interface DogCardProps {
  dog: Dog;
  onClick: (dog: Dog) => void;
}

const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';

const DogCard: React.FC<DogCardProps> = ({ dog, onClick }) => {
  const { t } = useTranslation('dogs');
  
  // Memoize age calculation
  const age = useMemo(() => {
    const birth = new Date(dog.dateOfBirth);
    const now = Date.now();
    const diffInMilliseconds = now - birth.getTime();
    const years = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    return `${years}y ${months}m`;
  }, [dog.dateOfBirth]);

  // Memoize image properties
  const { imageSrc, isPlaceholder } = useMemo(() => ({
    imageSrc: dog.image || PLACEHOLDER_IMAGE_PATH,
    isPlaceholder: !dog.image || dog.image === PLACEHOLDER_IMAGE_PATH
  }), [dog.image]);

  // Memoize event handlers
  const handleCardClick = useCallback(() => {
    onClick(dog);
  }, [dog, onClick]);

  const handleViewProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(dog);
  }, [dog, onClick]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== PLACEHOLDER_IMAGE_PATH) {
      target.src = PLACEHOLDER_IMAGE_PATH;
    }
  }, []);

  const litterCount = dog.breedingHistory?.litters?.length || 0;

  return (
    <Card className="dog-card w-full h-full flex flex-col overflow-hidden" onClick={handleCardClick}>
      <CardHeader className="p-0">
        <div className="relative w-full">
          <AspectRatio ratio={1/1}>
            <img 
              src={imageSrc} 
              alt={dog.name} 
              className="object-cover w-full h-full"
              onError={handleImageError}
            />
            {isPlaceholder && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Image className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
          </AspectRatio>
          <div className="absolute top-2 right-2">
            <Badge className={dog.gender === 'male' ? 'bg-blue-500' : 'bg-rose-400'}>
              {dog.gender === 'male' ? t('display.genderBadge.male') : t('display.genderBadge.female')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg mb-1">{dog.name}</h3>
        {dog.registeredName ? (
          <p className="text-sm text-muted-foreground mb-2">{dog.registeredName}</p>
        ) : (
          <p className="text-sm text-muted-foreground mb-2">{dog.breed}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{t('display.age')}: {age}</span>
        </div>
        {litterCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Heart className="h-3 w-3" />
            <span>{t('display.litters')}: {litterCount}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 mt-auto">
        <Button variant="outline" className="w-full text-sm" onClick={handleViewProfile}>
          {t('navigation.viewProfile')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default memo(DogCard);
