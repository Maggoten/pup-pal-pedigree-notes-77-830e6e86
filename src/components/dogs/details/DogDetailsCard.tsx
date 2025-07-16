
import { Dog as DogIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dog } from '@/types/dogs';
import DogInfoDisplay from '../DogInfoDisplay';
import DogEditForm from '../DogEditForm';
import { DogFormValues } from '../DogFormFields';
import DogActions from '../actions/DogActions';

interface DogDetailsCardProps {
  dog: Dog;
  isEditing: boolean;
  isSaving: boolean;
  loading: boolean;
  lastError: string | null;
  onSave: (values: DogFormValues) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const DogDetailsCard: React.FC<DogDetailsCardProps> = ({
  dog,
  isEditing,
  isSaving,
  loading,
  lastError,
  onSave,
  onCancelEdit,
  onDelete,
  onEdit,
}) => {
  const handleFormSave = () => {
    // Trigger form submission
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

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
            isLoading={isSaving || loading}
          />
        ) : (
          <DogInfoDisplay dog={dog} />
        )}
        
        {lastError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            <strong>Error:</strong> {lastError}
          </div>
        )}
      </CardContent>

      <DogActions
        isEditing={isEditing}
        onDelete={onDelete}
        onEdit={onEdit}
        onCancel={onCancelEdit}
        onSave={handleFormSave}
        loading={loading}
        isSaving={isSaving}
      />
    </Card>
  );
};

export default DogDetailsCard;
