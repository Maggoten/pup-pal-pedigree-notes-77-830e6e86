import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArchivedPregnancyData } from '@/services/PregnancyArchivedService';
import { useNavigate } from 'react-router-dom';

interface CreateLitterFromArchivedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pregnancyData: ArchivedPregnancyData;
  pregnancyId: string;
  onLitterCreated?: () => void;
}

const CreateLitterFromArchivedDialog: React.FC<CreateLitterFromArchivedDialogProps> = ({
  open,
  onOpenChange,
  pregnancyData,
  pregnancyId,
  onLitterCreated
}) => {
  const { t, i18n } = useTranslation('pregnancy');
  const { t: tLitter } = useTranslation('litter');
  const navigate = useNavigate();
  const locale = i18n.language === 'sv' ? sv : undefined;

  const [litterName, setLitterName] = useState(
    `${pregnancyData.femaleName}s kull`
  );
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    pregnancyData.actualBirthDate || undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!litterName.trim()) {
      toast.error(tLitter('validation.nameRequired', 'Litter name is required'));
      return;
    }

    if (!dateOfBirth) {
      toast.error(tLitter('validation.dateRequired', 'Birth date is required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('Not authenticated');
        return;
      }

      // Create the litter
      const { data: newLitter, error: litterError } = await supabase
        .from('litters')
        .insert({
          name: litterName.trim(),
          dam_name: pregnancyData.femaleName,
          sire_name: pregnancyData.maleName,
          dam_id: pregnancyData.femaleId || null,
          sire_id: pregnancyData.maleId || null,
          date_of_birth: dateOfBirth.toISOString(),
          user_id: sessionData.session.user.id,
          pregnancy_id: pregnancyId
        })
        .select()
        .single();

      if (litterError) {
        console.error('Error creating litter:', litterError);
        toast.error(tLitter('toasts.error.failedToCreate', 'Failed to create litter'));
        return;
      }

      toast.success(tLitter('toasts.success.litterCreated', 'Litter created successfully'));
      
      onOpenChange(false);
      
      if (onLitterCreated) {
        onLitterCreated();
      }

      // Navigate to the new litter
      navigate(`/my-litters?selected=${newLitter.id}`);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error(tLitter('toasts.error.failedToCreate', 'Failed to create litter'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('archived.litter.createLitter')}</DialogTitle>
          <DialogDescription>
            {t('archived.litter.createLitterDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Litter Name */}
          <div className="grid gap-2">
            <Label htmlFor="litterName">{tLitter('form.litterName', 'Litter Name')}</Label>
            <Input
              id="litterName"
              value={litterName}
              onChange={(e) => setLitterName(e.target.value)}
              placeholder={tLitter('form.litterNamePlaceholder', 'Enter litter name')}
            />
          </div>

          {/* Parents (read-only) */}
          <div className="grid gap-2">
            <Label>{tLitter('form.parents', 'Parents')}</Label>
            <p className="text-sm text-muted-foreground">
              {pregnancyData.femaleName} × {pregnancyData.maleName}
            </p>
          </div>

          {/* Date of Birth */}
          <div className="grid gap-2">
            <Label>{tLitter('form.dateOfBirth', 'Date of Birth')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? (
                    format(dateOfBirth, 'PPP', { locale })
                  ) : (
                    <span>{tLitter('form.selectDate', 'Select date')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('archived.litter.createLitter')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLitterFromArchivedDialog;
