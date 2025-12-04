import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Heart, Edit, Dog, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { ArchivedPregnancyData } from '@/services/PregnancyArchivedService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DatePicker from '@/components/common/DatePicker';
import { updateActualBirthDate } from '@/services/PregnancyService';
import { useToast } from '@/hooks/use-toast';
interface ArchivedPregnancyHeroProps {
  data: ArchivedPregnancyData;
  pregnancyId: string;
}
const ArchivedPregnancyHero: React.FC<ArchivedPregnancyHeroProps> = ({
  data,
  pregnancyId
}) => {
  const {
    t,
    i18n
  } = useTranslation('pregnancy');
  const {
    toast
  } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>(data.actualBirthDate || new Date());
  const [saving, setSaving] = useState(false);
  const locale = i18n.language === 'sv' ? sv : undefined;

  // Helper function to translate dog names
  const translateDogName = (name: string): string => {
    if (name === "Unknown Male") return t('display.unknownMale');
    if (name === "Unknown Female") return t('display.unknownFemale');
    return name;
  };
  const handleSaveBirthDate = async () => {
    setSaving(true);
    const success = await updateActualBirthDate(pregnancyId, birthDate);
    setSaving(false);
    if (success) {
      toast({
        title: t('toasts.success.birthDateUpdated'),
        description: t('toasts.success.birthDateUpdatedDescription')
      });
      setEditDialogOpen(false);
      window.location.reload(); // Reload to show updated data
    } else {
      toast({
        title: t('toasts.error.failedToUpdate'),
        description: t('toasts.error.failedToUpdateDescription'),
        variant: 'destructive'
      });
    }
  };
  return <>
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-pink-500" />
            {t('archived.hero.title', {
            femaleName: translateDogName(data.femaleName),
            maleName: translateDogName(data.maleName)
          })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fas 6: Parent Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dam (Female) Card */}
            <div className="bg-white/70 p-4 rounded-lg border border-pink-100">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12 border-2 border-pink-200">
                  <AvatarImage src={data.femaleImageUrl} alt={data.femaleName} />
                  <AvatarFallback className="bg-pink-100 text-pink-700">
                    <Dog className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t('archived.hero.dam', 'Tik')}
                  </p>
                  <p className="font-semibold text-lg">{translateDogName(data.femaleName)}</p>
                </div>
              </div>
              {(data.femaleBreed || data.femaleRegistration) && <div className="text-sm text-muted-foreground space-y-1 mt-2 pl-15">
                  {data.femaleBreed && <p className="flex items-center gap-1">
                       {data.femaleBreed}
                    </p>}
                  {data.femaleRegistration && <p className="flex items-center gap-1">
                      <Award className="h-3 w-3" /> {data.femaleRegistration}
                    </p>}
                </div>}
            </div>

            {/* Sire (Male) Card */}
            <div className="bg-white/70 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-12 w-12 border-2 border-blue-200">
                  <AvatarImage src={data.externalMaleImageUrl} alt={data.maleName} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    <Dog className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {t('archived.hero.sire', 'Hane')}
                  </p>
                  <p className="font-semibold text-lg">{translateDogName(data.maleName)}</p>
                </div>
              </div>
              {(data.externalMaleBreed || data.externalMaleRegistration) && <div className="text-sm text-muted-foreground space-y-1 mt-2 pl-15">
                  {data.externalMaleBreed && <p className="flex items-center gap-1">
                      <Dog className="h-3 w-3" /> {data.externalMaleBreed}
                    </p>}
                  {data.externalMaleRegistration && <p className="flex items-center gap-1">
                      <Award className="h-3 w-3" /> {data.externalMaleRegistration}
                    </p>}
                </div>}
            </div>
          </div>

          {/* Date Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Mating Date */}
            <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg">
              <Calendar className="h-5 w-5 text-pink-600" />
              <div>
                <p className="text-sm text-muted-foreground">{t('archived.hero.matingDate')}</p>
                <p className="font-medium">{format(data.matingDate, 'PPP', {
                  locale
                })}</p>
              </div>
            </div>

            {/* Birth Date with Edit Button */}
            <div className="flex items-center gap-3 bg-white/70 p-3 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('archived.hero.birthDate')}</p>
                <p className="font-medium">
                  {data.actualBirthDate ? format(data.actualBirthDate, 'PPP', {
                  locale
                }) : t('archived.hero.noBirthDate')}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditDialogOpen(true)} className="ml-auto">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Gestation Length */}
          {data.gestationLength && <div className="bg-white/70 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('archived.hero.gestationLength')}</p>
              <p className="text-lg font-semibold text-purple-700">
                {data.gestationLength} {t('archived.hero.days')}
              </p>
            </div>}

          {/* Puppy Count */}
          {data.linkedLitter && <div className="bg-white/70 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('archived.hero.puppies')}</p>
              <p className="text-lg font-semibold text-pink-700">
                {t('archived.hero.puppiesCount', {
              total: data.linkedLitter.totalPuppies,
              alive: data.linkedLitter.alivePuppies,
              dead: data.linkedLitter.deadPuppies
            })}
              </p>
            </div>}

          {!data.linkedLitter && <div className="bg-white/70 p-3 rounded-lg text-center text-muted-foreground">
              {t('archived.hero.noPuppies')}
            </div>}
        </CardContent>
      </Card>

      {/* Edit Birth Date Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('archived.hero.editBirthDate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <DatePicker date={birthDate} setDate={setBirthDate} label={t('archived.hero.birthDate')} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t('actions.cancel')}
              </Button>
              <Button onClick={handleSaveBirthDate} disabled={saving}>
                {saving ? t('loading.saving') : t('actions.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>;
};
export default ArchivedPregnancyHero;