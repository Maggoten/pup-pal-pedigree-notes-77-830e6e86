import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Litter } from '@/types/breeding';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Baby, Heart, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import DatePicker from '@/components/common/DatePicker';
import { format } from 'date-fns';

interface Pregnancy {
  id: string;
  mating_date: string;
  expected_due_date: string;
  status: string;
  female_dog_id: string | null;
  male_dog_id: string | null;
  external_male_name: string | null;
  external_male_breed: string | null;
  external_male_registration: string | null;
  external_male_image_url: string | null;
  femaleName?: string;
  maleName?: string;
}

interface PregnancyTabContentProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
}

const PregnancyTabContent: React.FC<PregnancyTabContentProps> = ({ 
  onClose, 
  onLitterAdded
}) => {
  const { toast } = useToast();
  const { user, isAuthReady } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation('litters');
  
  // State
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [selectedPregnancyId, setSelectedPregnancyId] = useState('');
  const [litterName, setLitterName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());

  // Fetch active pregnancies
  useEffect(() => {
    const fetchPregnancies = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data: pregnancyData, error } = await supabase
          .from('pregnancies')
          .select(`
            id,
            mating_date,
            expected_due_date,
            status,
            female_dog_id,
            male_dog_id,
            external_male_name,
            external_male_breed,
            external_male_registration,
            external_male_image_url
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('mating_date', { ascending: false });

        if (error) throw error;

        // Fetch dog names for each pregnancy
        const enrichedPregnancies: Pregnancy[] = await Promise.all(
          (pregnancyData || []).map(async (pregnancy) => {
            let femaleName = 'Okänd tik';
            let maleName = pregnancy.external_male_name || 'Okänd hane';

            if (pregnancy.female_dog_id) {
              const { data: femaleDog } = await supabase
                .from('dogs')
                .select('name')
                .eq('id', pregnancy.female_dog_id)
                .single();
              if (femaleDog) femaleName = femaleDog.name;
            }

            if (pregnancy.male_dog_id && !pregnancy.external_male_name) {
              const { data: maleDog } = await supabase
                .from('dogs')
                .select('name')
                .eq('id', pregnancy.male_dog_id)
                .single();
              if (maleDog) maleName = maleDog.name;
            }

            return {
              ...pregnancy,
              femaleName,
              maleName
            };
          })
        );

        setPregnancies(enrichedPregnancies);

        // Auto-select first pregnancy
        if (enrichedPregnancies.length > 0) {
          const first = enrichedPregnancies[0];
          setSelectedPregnancyId(first.id);
          setLitterName(`${first.femaleName}s kull`);
        }
      } catch (error) {
        console.error('Error fetching pregnancies:', error);
        toast({
          title: t('dialog.toasts.error.title'),
          description: 'Kunde inte hämta dräktigheter',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPregnancies();
  }, [user, t, toast]);

  // Update form when selected pregnancy changes
  useEffect(() => {
    if (selectedPregnancyId) {
      const selected = pregnancies.find(p => p.id === selectedPregnancyId);
      if (selected) {
        setLitterName(`${selected.femaleName}s kull`);
      }
    }
  }, [selectedPregnancyId, pregnancies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (!selectedPregnancyId) {
        toast({
          title: t('dialog.toasts.missingInfo.title'),
          description: 'Välj en dräktighet',
          variant: "destructive"
        });
        return;
      }
      
      if (!litterName) {
        toast({
          title: t('dialog.toasts.missingInfo.title'),
          description: t('dialog.toasts.missingInfo.plannedLitterName'),
          variant: "destructive"
        });
        return;
      }
      
      if (!isAuthReady || !user) {
        toast({
          title: t('dialog.toasts.auth.pleaseWait'),
          description: t('dialog.toasts.auth.preparing'),
        });
        return;
      }
      
      const selectedPregnancy = pregnancies.find(p => p.id === selectedPregnancyId);
      
      if (!selectedPregnancy) {
        throw new Error("Vald dräktighet hittades inte");
      }
      
      console.log("Creating litter from pregnancy:", selectedPregnancy);
      
      // Generate UUID for new litter
      const newLitterId = crypto.randomUUID();
      
      // Determine sire ID - use external marker if external male
      const isExternal = !!selectedPregnancy.external_male_name && !selectedPregnancy.male_dog_id;
      const sireId = isExternal 
        ? `external-${selectedPregnancy.id}` 
        : selectedPregnancy.male_dog_id || '';
      
      const newLitter: Litter = {
        id: newLitterId,
        name: litterName,
        dateOfBirth: dateOfBirth.toISOString(),
        sireId,
        damId: selectedPregnancy.female_dog_id || '',
        sireName: selectedPregnancy.maleName || 'Okänd hane',
        damName: selectedPregnancy.femaleName || 'Okänd tik',
        puppies: [],
        user_id: user.id,
        pregnancyId: selectedPregnancy.id
      };
      
      console.log("Submitting new litter:", newLitter);
      onLitterAdded(newLitter);
      
      // Update pregnancy to completed with actual birth date
      const { error: pregnancyError } = await supabase
        .from('pregnancies')
        .update({
          status: 'completed',
          actual_birth_date: dateOfBirth.toISOString()
        })
        .eq('id', selectedPregnancyId);

      if (pregnancyError) {
        console.error('Error updating pregnancy status:', pregnancyError);
      } else {
        console.log('Pregnancy marked as completed:', selectedPregnancyId);
      }

      // Also update any linked planned_litters
      const { data: matingDates } = await supabase
        .from('mating_dates')
        .select('planned_litter_id')
        .eq('pregnancy_id', selectedPregnancyId)
        .limit(1);

      if (matingDates && matingDates.length > 0 && matingDates[0].planned_litter_id) {
        const { error: plannedError } = await supabase
          .from('planned_litters')
          .update({
            status: 'completed',
            litter_id: newLitterId,
            completed_at: new Date().toISOString()
          })
          .eq('id', matingDates[0].planned_litter_id);

        if (plannedError) {
          console.error('Error updating planned litter:', plannedError);
        } else {
          console.log('Planned litter marked as completed');
        }
      }
      
      toast({
        title: t('dialog.toasts.success.title'),
        description: t('dialog.toasts.success.createdFromPlanned', { name: litterName })
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating litter from pregnancy:", error);
      toast({
        title: t('dialog.toasts.error.title'),
        description: "Kunde inte skapa kull från dräktighet",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pregnancies.length === 0) {
    return (
      <div className="text-center py-6">
        <Baby className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">Inga aktiva dräktigheter</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Du har inga aktiva dräktigheter att skapa en kull från.
        </p>
        <DialogFooter className="mt-6 justify-center">
          <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
            {t('dialog.buttons.close')}
          </Button>
        </DialogFooter>
      </div>
    );
  }

  const selectedPregnancy = pregnancies.find(p => p.id === selectedPregnancyId);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pregnancy Selection */}
        <div className="space-y-2">
          <Label>{t('dialog.pregnancyForm.selectPregnancy', 'Välj dräktighet')}</Label>
          <Select value={selectedPregnancyId} onValueChange={setSelectedPregnancyId}>
            <SelectTrigger>
              <SelectValue placeholder="Välj dräktighet..." />
            </SelectTrigger>
            <SelectContent>
              {pregnancies.map(pregnancy => (
                <SelectItem key={pregnancy.id} value={pregnancy.id}>
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-pink-500" />
                    <span>{pregnancy.femaleName} × {pregnancy.maleName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({format(new Date(pregnancy.mating_date), 'dd MMM yyyy')})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Pregnancy Info */}
        {selectedPregnancy && (
          <div className="p-3 bg-pink-50 rounded-lg border border-pink-200 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-pink-600" />
              <span className="text-muted-foreground">Parningsdatum:</span>
              <span className="font-medium">
                {format(new Date(selectedPregnancy.mating_date), 'dd MMMM yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Baby className="h-4 w-4 text-purple-600" />
              <span className="text-muted-foreground">Beräknat födelsedatum:</span>
              <span className="font-medium">
                {format(new Date(selectedPregnancy.expected_due_date), 'dd MMMM yyyy')}
              </span>
            </div>
            {selectedPregnancy.external_male_breed && (
              <div className="text-xs text-muted-foreground">
                Extern hane: {selectedPregnancy.external_male_breed}
                {selectedPregnancy.external_male_registration && 
                  ` (${selectedPregnancy.external_male_registration})`}
              </div>
            )}
          </div>
        )}

        {/* Litter Name */}
        <div className="space-y-2">
          <Label htmlFor="litterName">{t('dialog.form.litterName')}</Label>
          <Input
            id="litterName"
            value={litterName}
            onChange={(e) => setLitterName(e.target.value)}
            placeholder="T.ex. Bellas kull 2024"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label>{t('dialog.form.dateOfBirth')}</Label>
          <DatePicker
            date={dateOfBirth}
            setDate={setDateOfBirth}
          />
        </div>
      </form>
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
          {t('dialog.buttons.cancel')}
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('dialog.buttons.creating')}
            </>
          ) : (
            t('dialog.buttons.createFromPlanned')
          )}
        </Button>
      </DialogFooter>
    </>
  );
};

export default PregnancyTabContent;
