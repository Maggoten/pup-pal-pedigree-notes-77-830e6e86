
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDogs } from '@/context/DogsContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import DatePicker from '@/components/common/DatePicker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { addDays } from 'date-fns';
import { createPregnancy } from '@/services/PregnancyService';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';
import { useTranslation } from 'react-i18next';

interface AddPregnancyDialogProps {
  onClose: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPregnancyDialog: React.FC<AddPregnancyDialogProps> = ({ 
  onClose, 
  open,
  onOpenChange
}) => {
  const { t } = useTranslation('pregnancy');
  const { dogs } = useDogs();
  const [loading, setLoading] = useState(false);
  const [femaleDogId, setFemaleDogId] = useState<string>('');
  const [matingDate, setMatingDate] = useState<Date>(new Date());
  const [useExternalMale, setUseExternalMale] = useState(false);
  const [maleDogId, setMaleDogId] = useState<string>('');
  const [externalMaleName, setExternalMaleName] = useState('');
  
  // Get dogs by gender
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  const maleDogs = dogs.filter(dog => dog.gender === 'male');
  
  // Calculate expected due date (63 days from mating)
  const expectedDueDate = addDays(matingDate, 63);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!femaleDogId) {
      toast({
        title: t('toasts.error.missingInformation'),
        description: t('toasts.error.selectFemaleDog'),
        variant: "destructive"
      });
      return;
    }
    
    if (!useExternalMale && !maleDogId) {
      toast({
        title: t('toasts.error.missingInformation'),
        description: t('toasts.error.selectMaleDog'),
        variant: "destructive"
      });
      return;
    }
    
    if (useExternalMale && !externalMaleName) {
      toast({
        title: t('toasts.error.missingInformation'),
        description: t('toasts.error.enterExternalMaleName'),
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      await createPregnancy({
        femaleDogId,
        maleDogId: useExternalMale ? null : maleDogId,
        externalMaleName: useExternalMale ? externalMaleName : null,
        matingDate,
        expectedDueDate
      });
      
      // Calendar events will be automatically synced by useSupabaseCalendarEvents
      console.log('Pregnancy created successfully, calendar will auto-sync');
      
      toast({
        title: t('toasts.success.pregnancyAdded'),
        description: t('toasts.success.pregnancyAddedDescription'),
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding pregnancy:', error);
      toast({
        title: t('toasts.error.failedToAddPregnancy'),
        description: t('toasts.error.failedToAddPregnancyDescription'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('forms.addPregnancy.title')}</DialogTitle>
            <DialogDescription>
              {t('forms.addPregnancy.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Female Dog Selection */}
            <div className="grid gap-2">
              <Label htmlFor="female-dog">{t('forms.addPregnancy.femaleLabel')}</Label>
              <Select value={femaleDogId} onValueChange={setFemaleDogId}>
                <SelectTrigger id="female-dog" className="bg-white">
                  <SelectValue placeholder={t('forms.addPregnancy.femalePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {femaleDogs.length > 0 ? (
                    femaleDogs.map(dog => (
                      <SelectItem key={dog.id} value={dog.id}>
                        {dog.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-dogs" disabled>
                      {t('forms.addPregnancy.noFemaleDogs')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* External Male Toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="external-male" 
                checked={useExternalMale} 
                onCheckedChange={setUseExternalMale} 
              />
              <Label htmlFor="external-male">{t('forms.addPregnancy.externalMaleToggle')}</Label>
            </div>
            
            {/* Male Dog Selection (if not external) */}
            {!useExternalMale && (
              <div className="grid gap-2">
                <Label htmlFor="male-dog">{t('forms.addPregnancy.maleLabel')}</Label>
                <Select value={maleDogId} onValueChange={setMaleDogId}>
                  <SelectTrigger id="male-dog" className="bg-white">
                    <SelectValue placeholder={t('forms.addPregnancy.malePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {maleDogs.length > 0 ? (
                      maleDogs.map(dog => (
                        <SelectItem key={dog.id} value={dog.id}>
                          {dog.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-dogs" disabled>
                        {t('forms.addPregnancy.noMaleDogs')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* External Male Name (if external) */}
            {useExternalMale && (
              <div className="grid gap-2">
                <Label htmlFor="external-male-name">{t('forms.addPregnancy.externalMaleNameLabel')}</Label>
                <Input 
                  id="external-male-name" 
                  value={externalMaleName} 
                  onChange={(e) => setExternalMaleName(e.target.value)} 
                  placeholder={t('forms.addPregnancy.externalMaleNamePlaceholder')}
                  className="bg-white"
                />
              </div>
            )}
            
            {/* Mating Date */}
            <div className="grid gap-2">
              <Label>{t('forms.addPregnancy.matingDateLabel')}</Label>
              <DatePicker date={matingDate} setDate={setMatingDate} />
            </div>
            
            {/* Expected Due Date (Read-only) */}
            <div className="grid gap-2">
              <Label>{t('forms.addPregnancy.expectedDueDateLabel')}</Label>
              <div className="p-2 border rounded-md bg-muted/20">
                {expectedDueDate.toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('loading.saving')}
                </>
              ) : (
                t('actions.addPregnancy')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPregnancyDialog;
