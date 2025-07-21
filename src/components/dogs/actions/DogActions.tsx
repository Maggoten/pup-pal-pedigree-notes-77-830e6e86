
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Trash2, Save } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DogActionsProps {
  isEditing: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  loading: boolean;
  isSaving: boolean;
}

const DogActions: React.FC<DogActionsProps> = ({
  isEditing,
  onDelete,
  onEdit,
  onCancel,
  onSave,
  loading,
  isSaving
}) => {
  const { t } = useTranslation('dogs');

  return (
    <CardFooter className="flex justify-between">
      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={loading || isSaving}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {t('form.actions.delete')}
      </Button>
      
      {isEditing ? (
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSaving}
          >
            {t('form.actions.cancel')}
          </Button>
          <Button 
            type="submit" 
            onClick={onSave}
            disabled={isSaving}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('form.actions.saving')}
              </>
            ) : (
              t('form.actions.saveChanges')
            )}
          </Button>
        </div>
      ) : (
        <Button onClick={onEdit} disabled={loading || isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {t('form.actions.edit')}
        </Button>
      )}
    </CardFooter>
  );
};

export default DogActions;
