
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Dog as DogIcon, ArrowLeft } from 'lucide-react';
import { Dog, useDogs } from '@/context/DogsContext';
import DogInfoDisplay from './DogInfoDisplay';
import DogEditForm from './DogEditForm';
import { DogFormValues } from './DogFormFields';

interface DogDetailsProps {
  dog: Dog;
}

const DogDetails: React.FC<DogDetailsProps> = ({ dog }) => {
  const { setActiveDog, updateDog } = useDogs();
  const [isEditing, setIsEditing] = useState(false);
  
  const handleBack = () => {
    setActiveDog(null);
  };

  const handleSave = (values: DogFormValues) => {
    const formattedValues = {
      ...values,
      dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
      dewormingDate: values.dewormingDate ? format(values.dewormingDate, 'yyyy-MM-dd') : undefined,
      vaccinationDate: values.vaccinationDate ? format(values.vaccinationDate, 'yyyy-MM-dd') : undefined,
    };
    
    updateDog(dog.id, formattedValues);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DogIcon className="h-5 w-5" />
            {isEditing ? 'Edit Dog' : dog.name}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update dog information' : `${dog.breed} • ${dog.gender === 'male' ? 'Male' : 'Female'}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <DogEditForm 
              dog={dog} 
              onCancel={() => setIsEditing(false)} 
              onSave={handleSave} 
            />
          ) : (
            <DogInfoDisplay dog={dog} />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default DogDetails;
