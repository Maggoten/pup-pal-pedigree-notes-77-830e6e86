import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLitterQueries } from '@/hooks/litters/queries';
import { Litter, Puppy } from '@/types/breeding';
import SelectedLitterHeader from '@/components/litters/SelectedLitterHeader';
import SelectedLitterSection from '@/components/litters/SelectedLitterSection';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { litterService } from '@/services/LitterService';
import { toast } from '@/hooks/use-toast';

const LitterDetailsPage: React.FC = () => {
  const { litterId } = useParams<{ litterId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('litters');
  const { activeLitters, archivedLitters, isLoading, updateLitter, deleteLitter, archiveLitter, refreshLitters } = useLitterQueries();
  const [damImageUrl, setDamImageUrl] = useState<string | undefined>(undefined);

  // Combine active and archived litters
  const allLitters = [...(activeLitters || []), ...(archivedLitters || [])];
  const litter = allLitters.find(l => l.id === litterId);

  // Fetch dam image
  useEffect(() => {
    const fetchDamImage = async () => {
      if (litter?.damId) {
        const { data: dog } = await supabase
          .from('dogs')
          .select('image_url')
          .eq('id', litter.damId)
          .single();
        
        if (dog?.image_url) {
          setDamImageUrl(dog.image_url);
        }
      }
    };
    
    fetchDamImage();
  }, [litter?.damId]);

  const handleAddPuppy = async (puppy: Puppy) => {
    if (!litterId) return;
    
    try {
      await litterService.addPuppy(litterId, puppy);
      await refreshLitters();
      toast({
        title: t('toast.success'),
        description: `${puppy.name} has been added to the litter.`
      });
    } catch (error) {
      console.error('Error adding puppy:', error);
      toast({
        title: t('toast.error'),
        description: "Failed to add puppy. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePuppy = async (puppy: Puppy) => {
    if (!litterId) return;
    
    try {
      await litterService.updatePuppy(litterId, puppy);
      await refreshLitters();
    } catch (error) {
      console.error('Error updating puppy:', error);
      toast({
        title: t('toast.error'),
        description: "Failed to update puppy. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePuppy = async (puppyId: string) => {
    try {
      await litterService.deletePuppy(puppyId);
      await refreshLitters();
      toast({
        title: t('toast.success'),
        description: "The puppy has been removed from the litter."
      });
    } catch (error) {
      console.error('Error deleting puppy:', error);
      toast({
        title: t('toast.error'),
        description: "Failed to delete puppy. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLitter = (updatedLitter: Litter) => {
    updateLitter(updatedLitter);
  };

  const handleDeleteLitter = (litterId: string) => {
    deleteLitter(litterId);
    navigate('/my-litters');
  };

  const handleArchiveLitter = (litterId: string, archive: boolean) => {
    archiveLitter(litterId, archive);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warmbeige-50 via-white to-warmgreen-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!litter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warmbeige-50 via-white to-warmgreen-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-litters')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('actions.backToLitters')}
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('litter.notFound')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warmbeige-50 via-white to-warmgreen-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/my-litters')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('actions.backToLitters')}
        </Button>

        <SelectedLitterHeader
          litter={litter}
          damImageUrl={damImageUrl}
          onUpdateLitter={handleUpdateLitter}
          onDeleteLitter={handleDeleteLitter}
          onArchiveLitter={handleArchiveLitter}
        />

        <SelectedLitterSection
          litter={litter}
          onAddPuppy={handleAddPuppy}
          onUpdatePuppy={handleUpdatePuppy}
          onDeletePuppy={handleDeletePuppy}
          onUpdateLitter={handleUpdateLitter}
          onDeleteLitter={handleDeleteLitter}
          onArchiveLitter={handleArchiveLitter}
        />
      </div>
    </div>
  );
};

export default LitterDetailsPage;
