
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dog } from '@/types/dogs';

interface DogCardProps {
  dog: Dog;
  onClick: () => void;
}

const DogCard: React.FC<DogCardProps> = ({ dog, onClick }) => {
  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - birth.getTime();
    const years = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    return `${years}y ${months}m`;
  };

  // Define this as a constant to ensure we're not accidentally modifying the file path
  const PLACEHOLDER_IMAGE_PATH = '/placeholder.svg';
  
  // Determine which image to show (dog's image or placeholder)
  const imageSrc = dog.image_url || PLACEHOLDER_IMAGE_PATH;
  const isPlaceholder = !dog.image_url;

  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== PLACEHOLDER_IMAGE_PATH) {
      target.src = PLACEHOLDER_IMAGE_PATH;
    }
  };

  return (
    <Card className="dog-card w-full h-full overflow-hidden" onClick={onClick}>
      <CardHeader className="p-0">
        <div className="aspect-[4/3] w-full relative">
          <img 
            src={imageSrc} 
            alt={dog.name} 
            className="object-cover w-full h-full"
            onError={handleImageError}
            loading="lazy"
          />
          {isPlaceholder && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <Image className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={dog.gender === 'male' ? 'bg-blue-500' : 'bg-rose-400'}>
              {dog.gender === 'male' ? 'Male' : 'Female'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{dog.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{dog.breed}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Age: {calculateAge(dog.dateOfBirth)}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full text-sm" onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}>
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default React.memo(DogCard);
