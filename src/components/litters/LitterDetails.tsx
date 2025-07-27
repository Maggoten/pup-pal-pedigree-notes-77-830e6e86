import React, { useState, useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Archive, Trash2, PawPrint, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Litter, Puppy } from '@/types/breeding';
import LitterEditDialog from './LitterEditDialog';
import PuppyList from './PuppyList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

interface LitterDetailsProps {
  litter: Litter;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
}

const LitterDetails: React.FC<LitterDetailsProps> = ({
  litter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter
}) => {
  const { t } = useTranslation('litters');
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
  const isMobile = useIsMobile();
  
  // Use useMemo for computed values to prevent unnecessary recalculations
  const breeds = useMemo(() => {
    if (!litter.puppies || litter.puppies.length === 0) return 'Unknown';
    const breedSet = [...new Set(litter.puppies.filter(puppy => puppy.breed).map(puppy => puppy.breed))];
    if (breedSet.length === 0) return 'Unknown';
    return breedSet.join(', ');
  }, [litter.puppies]);
  
  const puppyCount = useMemo(() => litter.puppies?.length || 0, [litter.puppies]);
  const birthDate = useMemo(() => new Date(litter.dateOfBirth).toLocaleDateString(), [litter.dateOfBirth]);
  const litterAge = useMemo(() => 
    Math.floor((new Date().getTime() - new Date(litter.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 7)), 
    [litter.dateOfBirth]
  );
  
  const handleArchiveToggle = () => {
    onArchiveLitter(litter.id, !litter.archived);
  };
  
  const handleDeleteLitter = () => {
    if (confirm(t('litter.confirmations.deleteLitter', { name: litter.name }))) {
      onDeleteLitter(litter.id);
    }
  };

  return (
    <Card className="mb-6 shadow-sm bg-white border border-warmbeige-100">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {litter.name}
              {litter.archived && (
                <Badge variant="secondary" className="ml-2">{t('display.archived')}</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('litter.labels.bornLabel', { date: birthDate })} • {t('external.labels.sireName')}: {litter.sireName} • {litter.damName}
              {breeds !== 'Unknown' && ` • ${t('puppies.labels.breed')}: ${breeds}`}
            </CardDescription>
          </div>
          
          <div className={`flex ${isMobile ? 'flex-col mt-2 w-full' : 'flex-row'} gap-2`}>
            {/* Only render dialog when it's open to improve performance */}
            <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size={isMobile ? "default" : "sm"} 
                  className={`flex items-center gap-1.5 bg-warmbeige-50 hover:bg-warmbeige-100 ${isMobile ? 'w-full justify-center py-3' : ''}`}
                >
                  <Edit className="h-4 w-4" />
                  <span>{t('litter.actions.edit')}</span>
                </Button>
              </DialogTrigger>
              {showEditLitterDialog && (
                <LitterEditDialog 
                  litter={litter} 
                  onClose={() => setShowEditLitterDialog(false)} 
                  onUpdate={onUpdateLitter}
                  onUpdateLitter={onUpdateLitter}
                  onDelete={onDeleteLitter}
                  onArchive={onArchiveLitter}
                />
              )}
            </Dialog>
            
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "sm"}
              className={`flex items-center gap-1.5 bg-warmbeige-50 hover:bg-warmbeige-100 ${isMobile ? 'w-full justify-center py-3' : ''}`}
              onClick={handleArchiveToggle}
            >
              <Archive className="h-4 w-4" />
              <span>{litter.archived ? t('litter.actions.unarchive') : t('litter.actions.archive')}</span>
            </Button>
            
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "sm"}
              className={`flex items-center gap-1.5 text-destructive hover:bg-red-50 ${isMobile ? 'w-full justify-center py-3' : ''}`}
              onClick={handleDeleteLitter}
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('litter.actions.delete')}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('puppies.titles.litterInformation')}</h3>
          
          <Card className="bg-warmbeige-50 shadow-sm border border-warmbeige-100 rounded-xl">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-warmbeige-200">
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-primary" />
                    <span className="font-medium">{t('puppies.labels.totalPuppies')}</span>
                  </div>
                  <div className="text-xl font-bold">{puppyCount}</div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-warmbeige-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium">{t('puppies.labels.litterAge')}</span>
                  </div>
                  <div className="text-xl font-bold">{litterAge} {t('puppies.labels.weeks')}</div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    {litter.archived ? 
                      <XCircle className="h-5 w-5 text-muted-foreground" /> : 
                      <CheckCircle className="h-5 w-5 text-warmgreen-600" />
                    }
                    <span className="font-medium">{t('puppies.labels.status')}</span>
                  </div>
                  <div className={`text-xl font-bold ${!litter.archived ? 'text-warmgreen-600' : ''}`}>
                    {litter.archived ? t('display.archived') : t('display.active')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(LitterDetails);
