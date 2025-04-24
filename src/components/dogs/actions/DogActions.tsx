
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Trash2, Save } from 'lucide-react';

interface DogActionsProps {
  isEditing: boolean;
  onDelete: () => void;
  onEdit: () => void;
  loading: boolean;
  isSaving: boolean;
}

const DogActions: React.FC<DogActionsProps> = ({
  isEditing,
  onDelete,
  onEdit,
  loading,
  isSaving
}) => {
  return (
    <CardFooter className="flex justify-between">
      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={loading || isSaving}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
      
      {!isEditing ? (
        <Button onClick={onEdit} disabled={loading || isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Edit
        </Button>
      ) : null}
    </CardFooter>
  );
};

export default DogActions;
