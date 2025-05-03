
import React from 'react';
import { Dog } from '@/context/DogsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { isDogDeleted, formatDogName } from '@/utils/dogUtils';

interface DogCardProps {
  dog: Dog;
  onClick: (dog: Dog) => void;
}

const DogCard: React.FC<DogCardProps> = ({ dog, onClick }) => {
  const isDeleted = isDogDeleted(dog);
  const displayName = formatDogName(dog);
  
  const dogImage = dog.image || '/placeholder-dog.jpg';
  
  return (
    <Card className={`overflow-hidden cursor-pointer h-full flex flex-col ${isDeleted ? 'opacity-70' : ''}`}>
      <div className="relative h-48 overflow-hidden">
        {isDeleted && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
            <Badge variant="destructive" className="text-sm">Deleted</Badge>
          </div>
        )}
        
        <img 
          src={dogImage} 
          alt={displayName}
          className={`w-full h-full object-cover transform transition-transform hover:scale-105 ${isDeleted ? 'opacity-75' : ''}`}
        />
      </div>
      
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{displayName}</h3>
          <Badge variant={dog.gender === 'male' ? 'secondary' : 'default'}>
            {dog.gender === 'male' ? 'Male' : 'Female'}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-500">
          <p className="mb-1">Breed: {dog.breed || 'Not specified'}</p>
          <p className="mb-1">Born: {formatDateForDisplay(dog.dateOfBirth) || 'Unknown'}</p>
          {isDeleted && <p className="text-destructive mt-2">Deleted: {formatDateForDisplay(dog.deleted_at!)}</p>}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onClick(dog)} 
          variant="outline" 
          className="w-full"
          disabled={isDeleted}
        >
          {isDeleted ? 'Dog Deleted' : 'View Details'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DogCard;
