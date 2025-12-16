import React, { useState } from 'react';
import { Dog } from '@/types/dogs';
import { useTranslation } from 'react-i18next';
import { FileText, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { DogHealthService } from '@/services/dogs/dogHealthService';

interface HealthNotesSectionProps {
  dog: Dog;
  onUpdate?: () => void;
}

const HealthNotesSection: React.FC<HealthNotesSectionProps> = ({ dog, onUpdate }) => {
  const { t } = useTranslation('dogs');
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(dog.healthNotes || dog.health_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await DogHealthService.updateHealthNotes(dog.id, notes);
      toast({
        title: t('health.notes.saveSuccess', 'Notes saved'),
        description: t('health.notes.saveSuccessDesc', 'Health notes have been updated')
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('health.notes.saveError', 'Failed to save notes'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNotes(dog.healthNotes || dog.health_notes || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {t('health.notes.title', 'Health Notes')}
        </h3>
        {!isEditing && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            {t('common.edit', 'Edit')}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('health.notes.placeholder', 'Allergies, medications, special needs...')}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-1" />
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? t('common.loading', 'Loading...') : t('common.save', 'Save')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg border bg-card min-h-[100px]">
          {notes ? (
            <p className="text-sm whitespace-pre-wrap">{notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('health.notes.empty', 'No health notes recorded. Click edit to add notes about allergies, medications, or special needs.')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthNotesSection;
