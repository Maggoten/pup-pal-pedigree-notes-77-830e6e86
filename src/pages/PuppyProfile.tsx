import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ArrowLeft, Edit, Circle, Calendar, Weight, Ruler, FileText, Trash2, RefreshCw } from 'lucide-react';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import { Puppy } from '@/types/breeding';
import { usePuppyQueries } from '@/hooks/usePuppyQueries';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import EditPuppyDialog from '@/components/litters/puppies/EditPuppyDialog';
import PuppyMeasurementsChart from '@/components/litters/puppies/PuppyMeasurementsChart';
import PuppyMeasurementsDialog from '@/components/litters/puppies/PuppyMeasurementsDialog';
import DeleteConfirmationDialog from '@/components/litters/puppies/DeleteConfirmationDialog';

const PuppyProfile: React.FC = () => {
  const { litterId, puppyId } = useParams<{ litterId: string; puppyId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('litters');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMeasurementsDialog, setShowMeasurementsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const getLatestWeight = (puppy: Puppy) => {
    if (puppy.weightLog && puppy.weightLog.length > 0) {
      const sortedWeights = [...puppy.weightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedWeights[0].weight} kg`;
    }
    return puppy.currentWeight ? `${puppy.currentWeight} kg` : t('puppies.labels.notRecorded');
  };

  const getLatestHeight = (puppy: Puppy) => {
    if (puppy.heightLog && puppy.heightLog.length > 0) {
      const sortedHeights = [...puppy.heightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedHeights[0].height} cm`;
    }
    return t('puppies.labels.notRecorded');
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
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl font-bold text-warmgreen-800">
            {selectedPuppy.name}
            {selectedPuppy.registered_name && (
              <span className="text-xl font-normal italic text-green-800 ml-2">
                - {selectedPuppy.registered_name}
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {/* Main Info Grid - Photo and Details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] mb-8">
            {/* Profile Photo */}
            <div className="w-full max-w-[200px] mx-auto md:mx-0">
              <AspectRatio ratio={1/1} className="overflow-hidden rounded-lg border-2 border-warmbeige-200 shadow-sm">
                {selectedPuppy.imageUrl ? (
                  <img 
                    src={selectedPuppy.imageUrl} 
                    alt={selectedPuppy.name} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-warmgreen-100 text-warmgreen-800 font-medium text-6xl w-full h-full flex items-center justify-center">
                    {selectedPuppy.name.charAt(0)}
                  </div>
                )}
              </AspectRatio>
            </div>

            {/* Basic Info */}
            <div className="space-y-6">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Circle className={`h-5 w-5 ${selectedPuppy.gender === 'male' ? 'text-blue-500 fill-blue-500' : 'text-pink-500 fill-pink-500'}`} />
                  <span className="font-medium">{selectedPuppy.gender === 'male' ? t('puppies.labels.male') : t('puppies.labels.female')}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {selectedPuppy.birthDateTime 
                      ? format(parseISO(selectedPuppy.birthDateTime), 'MMM d, yyyy')
                      : t('puppies.labels.birthDateNotSet')
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Weight className="h-5 w-5 text-muted-foreground" />
                  <span>{getLatestWeight(selectedPuppy)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-muted-foreground" />
                  <span>{getLatestHeight(selectedPuppy)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-warmbeige-100 text-warmbeige-800">
                  {selectedPuppy.color}
                </Badge>
                <Badge variant="secondary" className="bg-warmbeige-100 text-warmbeige-800">
                  {selectedPuppy.breed}
                </Badge>
              </div>

              {/* Physical and Registration Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('puppies.titles.physicalDetails')}</h3>
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">{t('puppies.labels.birthWeight')}:</span>
                       <span className="text-sm">{selectedPuppy.birthWeight ? `${selectedPuppy.birthWeight} kg` : t('puppies.labels.notRecorded')}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">{t('puppies.labels.currentWeight')}:</span>
                       <span className="text-sm">{getLatestWeight(selectedPuppy)}</span>
                     </div>
                     {selectedPuppy.markings && (
                       <div className="flex justify-between">
                         <span className="text-sm text-muted-foreground">{t('puppies.labels.markings')}:</span>
                         <span className="text-sm">{selectedPuppy.markings}</span>
                       </div>
                     )}
                   </div>
                 </div>

                 <div>
                   <h3 className="text-lg font-semibold mb-3">{t('puppies.titles.registration')}</h3>
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">{t('puppies.labels.microchip')}:</span>
                       <span className="text-sm">{selectedPuppy.microchip || t('puppies.labels.notSet')}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">{t('puppies.labels.collar')}:</span>
                       <span className="text-sm">{selectedPuppy.collar || t('puppies.labels.notSet')}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-muted-foreground">{t('puppies.labels.breed')}:</span>
                       <span className="text-sm">{selectedPuppy.breed}</span>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Buyer Information */}
              {(selectedPuppy.status === 'Reserved' || selectedPuppy.status === 'Sold') && (
                 <div>
                   <h3 className="text-lg font-semibold mb-3">{t('puppies.titles.buyerInformation')}</h3>
                   <p className="text-sm">{selectedPuppy.newOwner || t('puppies.labels.informationNotAvailable')}</p>
                 </div>
              )}
            </div>
          </div>

           {/* Growth Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{t('puppies.titles.growthCharts')}</h3>
              <PuppyMeasurementsChart puppy={selectedPuppy} />
            </div>

          {/* Notes Section */}
          <div>
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <FileText className="h-5 w-5" />
               {t('puppies.titles.notesAndRecords')}
             </h3>
            {selectedPuppy.notes && selectedPuppy.notes.length > 0 ? (
              <div className="space-y-4">
                {selectedPuppy.notes
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((note, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(note.date), 'MMM d, yyyy - h:mm a')}
                      </p>
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t('puppies.messages.noNotesYet')}</p>
            )}
          </div>
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
