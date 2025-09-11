import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import { differenceInWeeks, parseISO } from 'date-fns';
import { Puppy } from '@/types/breeding';
import { usePuppyQueries } from '@/hooks/usePuppyQueries';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import EditPuppyDialog from '@/components/litters/puppies/EditPuppyDialog';
import PuppyMeasurementsDialog from '@/components/litters/puppies/PuppyMeasurementsDialog';
import DeleteConfirmationDialog from '@/components/litters/puppies/DeleteConfirmationDialog';
import PuppyOverviewTab from '@/components/litters/puppies/tabs/PuppyOverviewTab';
import PuppyDevelopmentTab from '@/components/litters/puppies/tabs/PuppyDevelopmentTab';

const PuppyProfile: React.FC = () => {
  const { litterId, puppyId } = useParams<{ litterId: string; puppyId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('litters');
  
  // Ensure users start at the top of the page
  useScrollToTop();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMeasurementsDialog, setShowMeasurementsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Use the proper hook for puppy data
  const {
    litter,
    error,
    isLoading,
    updatePuppy,
    deletePuppy,
    refreshLitterData
  } = usePuppyQueries(litterId || '');

  // Find the puppy in the litter
  const selectedPuppy = litter?.puppies?.find(p => p.id === puppyId);

  // Add logging to track when puppy data changes
  useEffect(() => {
    if (selectedPuppy) {
      console.log(`PuppyProfile: Puppy data updated for ${selectedPuppy.name}:`, {
        id: selectedPuppy.id,
        notesCount: selectedPuppy.notes?.length || 0,
        notes: selectedPuppy.notes?.map(n => ({
          date: n.date,
          content: n.content.substring(0, 30) + '...'
        })) || []
      });
    }
  }, [selectedPuppy?.notes]);

  // Handle missing parameters
  useEffect(() => {
    if (!litterId || !puppyId) {
      toast({
        title: "Error",
        description: "Missing litter or puppy ID",
        variant: "destructive"
      });
      navigate('/my-litters');
    }
  }, [litterId, puppyId, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load puppy information",
        variant: "destructive"
      });
    }
  }, [error]);

  // Handle puppy not found (only after data is loaded)
  useEffect(() => {
    if (!isLoading && litter && puppyId && !selectedPuppy) {
      console.log(`PuppyProfile: Puppy ${puppyId} not found in litter ${litter.name}`);
      toast({
        title: "Puppy not found",
        description: "The puppy you're looking for doesn't exist in this litter",
        variant: "destructive"
      });
      navigate('/my-litters');
    }
  }, [isLoading, litter, puppyId, selectedPuppy, navigate]);

  const handleBack = () => {
    // Navigate back to My Litters with the current litter selected
    navigate(`/my-litters?selected=${litterId}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log("PuppyProfile: Manual refresh initiated");
      await refreshLitterData();
      toast({
        title: "Refreshed",
        description: "Puppy data has been refreshed",
      });
    } catch (error) {
      console.error("PuppyProfile: Manual refresh failed:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh puppy data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditPuppy = async (updatedPuppy: Puppy) => {
    try {
      await updatePuppy(updatedPuppy);
      setShowEditDialog(false);
      toast({
        title: "Success",
        description: "Puppy information updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update puppy information",
        variant: "destructive"
      });
    }
  };

  const handleUpdateMeasurements = async (updatedPuppy: Puppy) => {
    try {
      console.log(`PuppyProfile: Updating measurements for ${updatedPuppy.name}, notes count: ${updatedPuppy.notes?.length || 0}`);
      await updatePuppy(updatedPuppy);
      toast({
        title: "Success",
        description: "Measurements updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update measurements",
        variant: "destructive"
      });
    }
  };

  const handleDeletePuppy = async () => {
    if (!selectedPuppy) return;
    
    try {
      await deletePuppy(selectedPuppy.id);
      setShowDeleteDialog(false);
      navigate('/my-litters');
      toast({
        title: "Puppy Deleted",
        description: `${selectedPuppy.name} has been deleted successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete puppy",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (puppy: Puppy) => {
    const status = puppy.status || 'Available';
    switch (status) {
      case 'Reserved':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">{t('puppies.statuses.reserved')}</Badge>;
      case 'Sold':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('puppies.statuses.sold')}</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{t('puppies.statuses.available')}</Badge>;
    }
  };

  const getPuppyAge = (puppy: Puppy) => {
    if (puppy.birthDateTime) {
      return differenceInWeeks(new Date(), parseISO(puppy.birthDateTime));
    }
    return litter ? differenceInWeeks(new Date(), parseISO(litter.dateOfBirth)) : 0;
  };

  if (isLoading || !selectedPuppy) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-lg w-48"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const puppyAge = getPuppyAge(selectedPuppy);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('puppies.actions.backToLitters')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('actions.refresh')}
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="shadow-sm">
        <CardHeader className="bg-primary/5 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-warmgreen-800">
                {selectedPuppy.name}
                {selectedPuppy.registered_name && (
                  <span className="text-xl font-normal italic text-green-800 ml-2">
                    - {selectedPuppy.registered_name}
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {puppyAge} {puppyAge === 1 ? 'vecka gammal' : 'veckor gammal'} • {litter?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(selectedPuppy)}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="overview" className="text-sm">
                Översikt
              </TabsTrigger>
              <TabsTrigger value="development" className="text-sm">
                Foton
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6 mt-0">
              <PuppyOverviewTab puppy={selectedPuppy} litter={litter} />
            </TabsContent>

            <TabsContent value="development" className="p-6 mt-0">
              <PuppyDevelopmentTab 
                puppy={selectedPuppy} 
                litter={litter}
                onUpdatePuppy={handleEditPuppy}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
          >
             <Trash2 className="h-4 w-4 mr-2" />
             {t('actions.delete')}
          </Button>
          <Button onClick={() => setShowEditDialog(true)}>
             <Edit className="h-4 w-4 mr-2" />
             {t('actions.edit')}
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditPuppyDialog
          puppy={selectedPuppy}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onUpdatePuppy={handleEditPuppy}
        />
      )}

      {/* Measurements Dialog */}
      {showMeasurementsDialog && (
        <PuppyMeasurementsDialog
          puppy={selectedPuppy}
          onClose={() => setShowMeasurementsDialog(false)}
          onUpdate={handleUpdateMeasurements}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedPuppy && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeletePuppy}
          title="Delete Puppy"
          description="Are you sure you want to delete this puppy? This action cannot be undone."
          itemDetails={selectedPuppy.name}
        />
      )}
    </div>
  );
};

export default PuppyProfile;
