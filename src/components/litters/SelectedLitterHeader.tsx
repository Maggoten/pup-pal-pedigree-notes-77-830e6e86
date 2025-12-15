
import React, { useState, useMemo, useCallback } from 'react';
import { parseISO } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Archive, Trash2 } from 'lucide-react';
import { Litter } from '@/types/breeding';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { formatDateWithLocale } from '@/utils/localizedDateFormat';
import LitterEditDialog from './LitterEditDialog';

interface SelectedLitterHeaderProps {
  litter: Litter;
  damImageUrl?: string;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
}

const SelectedLitterHeader: React.FC<SelectedLitterHeaderProps> = ({ 
  litter, 
  damImageUrl,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter
}) => {
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation('litters');

  // Memoize all date calculations and puppy stats
  const { birthDate, ageInWeeks, isRecent, puppyStats } = useMemo(() => {
    const birthDate = parseISO(litter.dateOfBirth);
    const ageInWeeks = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    
    return {
      birthDate,
      ageInWeeks,
      isRecent: ageInWeeks < 12,
      puppyStats: {
        total: litter.puppies?.length || 0,
        male: litter.puppies?.filter(p => p.gender === 'male').length || 0,
        female: litter.puppies?.filter(p => p.gender === 'female').length || 0
      }
    };
  }, [litter.dateOfBirth, litter.puppies]);

  const handleArchiveToggle = useCallback(() => {
    onArchiveLitter(litter.id, !litter.archived);
  }, [litter.id, litter.archived, onArchiveLitter]);
  
  const handleDeleteLitter = useCallback(() => {
    if (confirm(t('litter.confirmations.deleteLitter', { name: litter.name }))) {
      onDeleteLitter(litter.id);
    }
  }, [litter.id, litter.name, onDeleteLitter, t]);

  const handleCloseDialog = useCallback(() => {
    setShowEditLitterDialog(false);
  }, []);

  return (
    <div className="bg-white border border-warmbeige-200 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-warmbeige-200 shadow-sm">
          {damImageUrl ? (
            <AvatarImage src={damImageUrl} alt={litter.damName} className="object-cover" />
          ) : (
            <AvatarFallback className="bg-warmgreen-100 text-warmgreen-800 font-medium text-lg">
              {litter.damName.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-warmgreen-800">{litter.name}</h1>
            <div className="flex gap-2">
              {isRecent && !litter.archived && (
                <Badge variant="active" className="px-3 py-1">{t('filters.active')}</Badge>
              )}
              {litter.archived && (
                <Badge variant="archived" className="px-3 py-1">{t('filters.archived')}</Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground">{t('display.parents')}</p>
              <p className="font-medium">{litter.damName} × {litter.sireName}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">{t('display.dateOfBirth')}</p>
              <p className="font-medium">{formatDateWithLocale(birthDate, 'MMMM d, yyyy', i18n.language)}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">{t('display.age')}</p>
              <p className="font-medium">{ageInWeeks} {t('display.weeksOld')}</p>
            </div>
            
            {puppyStats.total > 0 && (
              <div>
                <p className="text-muted-foreground">{t('display.puppies')}</p>
                <p className="font-medium">
                  {puppyStats.total} {t('display.total')} 
                  <span className="text-blue-500 ml-2">{puppyStats.male} ♂</span>
                  <span className="text-pink-500 ml-2">{puppyStats.female} ♀</span>
                </p>
              </div>
            )}
          </div>
          
          <div className={`flex ${isMobile ? 'flex-row gap-2 justify-center' : 'flex-row gap-3'} mt-4`}>
            <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`flex items-center bg-warmbeige-50 hover:bg-warmbeige-100 ${isMobile ? 'px-2 min-w-[44px] h-10' : 'gap-1.5 h-9 px-4'}`}
                  title="Edit litter"
                >
                  <Edit className="h-4 w-4" />
                  {!isMobile && <span>{t('actions.edit')}</span>}
                </Button>
              </DialogTrigger>
              {showEditLitterDialog && (
                <LitterEditDialog 
                  litter={litter} 
                  onClose={handleCloseDialog} 
                  onUpdate={onUpdateLitter}
                  onUpdateLitter={onUpdateLitter}
                  onDelete={onDeleteLitter}
                  onArchive={onArchiveLitter}
                />
              )}
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm"
              className={`flex items-center bg-warmbeige-50 hover:bg-warmbeige-100 ${isMobile ? 'px-2 min-w-[44px] h-10' : 'gap-1.5 h-9 px-4'}`}
              onClick={handleArchiveToggle}
              title={litter.archived ? "Unarchive litter" : "Archive litter"}
            >
              <Archive className="h-4 w-4" />
              {!isMobile && <span>{litter.archived ? t('actions.unarchive') : t('actions.archive')}</span>}
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${isMobile ? 'px-2 min-w-[44px] h-10' : 'gap-1.5'}`}
              onClick={handleDeleteLitter}
              title="Delete litter"
            >
              <Trash2 className="h-4 w-4" />
              {!isMobile && <span>{t('actions.delete')}</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedLitterHeader;
