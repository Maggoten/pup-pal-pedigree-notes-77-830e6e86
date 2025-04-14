
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dog as DogIcon, Trash2, Loader2 } from 'lucide-react';
import DogInfoDisplay from '../DogInfoDisplay';
import DogEditForm from '../DogEditForm';
import { DogFormValues } from '../schema/dogFormSchema';
import { Dog } from '@/types/dogs';

interface DogDetailsCardProps {
  dog: Dog;
  isEditing: boolean;
  isDeletingDog: boolean;
  isUpdatingDog: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (values: DogFormValues) => Promise<void>;
  onDelete: () => void;
}

const DogDetailsCard: React.FC<DogDetailsCardProps> = ({
  dog,
  isEditing,
  isDeletingDog,
  isUpdatingDog,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) => {
  return (
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
            onCancel={onCancelEdit} 
            onSave={onSave}
            isSaving={isUpdatingDog}
          />
        ) : (
          <DogInfoDisplay dog={dog} />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isEditing && (
          <>
            <Button 
              variant="outline" 
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
              disabled={isDeletingDog}
            >
              {isDeletingDog ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
            <Button onClick={onEdit}>Edit</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default DogDetailsCard;
