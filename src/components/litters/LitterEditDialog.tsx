
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { CalendarIcon, Trash2, Archive, SquareCheck } from 'lucide-react';
import { Litter } from '@/types/breeding';
import { format } from 'date-fns';
import { parseISODate } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { PregnancySelector } from './dialog/PregnancySelector';

interface LitterEditDialogProps {
  litter: Litter;
  onClose: () => void;
  onUpdate: (litter: Litter) => void;
  onUpdateLitter: (litter: Litter) => void;
  onDelete: (litterId: string) => void;
  onArchive?: (litterId: string, archived: boolean) => void;
}

const LitterEditDialog: React.FC<LitterEditDialogProps> = ({ 
  litter, 
  onClose, 
  onUpdate,
  onUpdateLitter,
  onDelete,
  onArchive
}) => {
  const { t } = useTranslation('litters');
  const [litterName, setLitterName] = useState(litter.name);
  const [sireName, setSireName] = useState(litter.sireName);
  const [damName, setDamName] = useState(litter.damName);
  const [pregnancyId, setPregnancyId] = useState<string | null>(litter.pregnancyId || null);
  
  // Parse the birth date correctly to avoid timezone issues
  const [birthDate, setBirthDate] = useState<Date>(
    parseISODate(litter.dateOfBirth) || new Date()
  );
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Set birth date time to noon to avoid timezone issues
    const safeBirthDate = new Date(birthDate);
    safeBirthDate.setHours(12, 0, 0, 0);
    
    const updatedLitter: Litter = {
      ...litter,
      name: litterName,
      sireName: sireName,
      damName: damName,
      dateOfBirth: safeBirthDate.toISOString().split('T')[0],
      pregnancyId: pregnancyId || undefined
    };
    
    // Use both update functions to maintain compatibility
    onUpdate(updatedLitter);
    onUpdateLitter(updatedLitter);
    onClose();
  };
  
  return (
    <DialogContent className="sm:max-w-[600px] beige-gradient border-greige-300">
      <DialogHeader>
        <DialogTitle>{t('litter.titles.editLitter')}</DialogTitle>
        <DialogDescription>
          {t('litter.edit.description', { litterName: litter.name })}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('litter.labels.litterName')}</Label>
            <Input
              id="name"
              value={litterName}
              onChange={(e) => setLitterName(e.target.value)}
              required
              className="bg-white border-greige-300"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="sire">{t('litter.labels.sireName')}</Label>
            <Input
              id="sire"
              value={sireName}
              onChange={(e) => setSireName(e.target.value)}
              required
              className="bg-white border-greige-300"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dam">{t('litter.labels.damName')}</Label>
            <Input
              id="dam"
              value={damName}
              onChange={(e) => setDamName(e.target.value)}
              required
              className="bg-white border-greige-300"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dob">{t('litter.labels.dateOfBirth')}</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left bg-white border-greige-300"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(birthDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={(date) => {
                    if (date) {
                      // Set time to noon to avoid timezone issues
                      date.setHours(12, 0, 0, 0);
                      setBirthDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <PregnancySelector
            femaleId={litter.damId}
            selectedPregnancyId={pregnancyId}
            onPregnancyChange={setPregnancyId}
          />
          
          {onArchive && (
            <div className="mt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onArchive(litter.id, !litter.archived)}
                className="w-full flex items-center gap-2 bg-white border-greige-300"
              >
                {litter.archived ? (
                  <>
                    <SquareCheck className="h-4 w-4" />
                    {t('litter.edit.unarchiveButton')}
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    {t('litter.edit.archiveButton')}
                  </>
                )}
              </Button>
            </div>
          )}
          
          <div className="mt-4">
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertDescription className="flex items-center justify-between">
                <span>{t('litter.confirmations.deleteConfirmation')}</span>
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(litter.id)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('actions.delete')}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit">{t('litter.edit.saveChanges')}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default LitterEditDialog;
