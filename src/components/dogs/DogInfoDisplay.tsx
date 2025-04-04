
import React from 'react';
import { format } from 'date-fns';
import { Dog as DogIcon } from 'lucide-react';
import { Dog } from '@/context/DogsContext';

interface DogInfoDisplayProps {
  dog: Dog;
}

const DogInfoDisplay: React.FC<DogInfoDisplayProps> = ({ dog }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Photo</h3>
        <div className="aspect-square w-full overflow-hidden rounded-lg border border-border">
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
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Breed</h3>
            <p>{dog.breed}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
            <p>{dog.gender === 'male' ? 'Male' : 'Female'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
            <p>{format(new Date(dog.dateOfBirth), 'PPP')}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Color</h3>
            <p>{dog.color}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
            <p>{dog.registrationNumber || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Deworming Date</h3>
            <p>{dog.dewormingDate ? format(new Date(dog.dewormingDate), 'PPP') : 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Vaccination Date</h3>
            <p>{dog.vaccinationDate ? format(new Date(dog.vaccinationDate), 'PPP') : 'N/A'}</p>
          </div>
        </div>
        
        {dog.notes && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
            <p>{dog.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DogInfoDisplay;
