import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Circle, Calendar, Weight, Ruler, FileText } from 'lucide-react';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import { Puppy } from '@/types/breeding';
import useLitterManagement from '@/hooks/litters/useLitterManagement';
import { toast } from '@/components/ui/use-toast';
import EditPuppyDialog from '@/components/litters/puppies/EditPuppyDialog';
import PuppyMeasurementsChart from '@/components/litters/puppies/PuppyMeasurementsChart';

const PuppyProfile: React.FC = () => {
  const { litterId, puppyId } = useParams<{ litterId: string; puppyId: string }>();
  const navigate = useNavigate();
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    selectedLitter,
    handleSelectLitter,
    handleUpdatePuppy,
    isLoadingDetails
  } = useLitterManagement();

  // Load litter and find puppy when component mounts
  useEffect(() => {
    const loadPuppyData = async () => {
      if (!litterId || !puppyId) {
        toast({
          title: "Error",
          description: "Missing litter or puppy ID",
          variant: "destructive"
        });
        navigate('/my-litters');
        return;
      }

      // Load the litter if not already loaded
      if (!selectedLitter || selectedLitter.id !== litterId) {
        await handleSelectLitter({ id: litterId } as any);
      }
    };

    loadPuppyData();
  }, [litterId, puppyId, selectedLitter, handleSelectLitter, navigate]);

  // Find the puppy in the selected litter
  useEffect(() => {
    if (selectedLitter && selectedLitter.puppies && puppyId) {
      const puppy = selectedLitter.puppies.find(p => p.id === puppyId);
      if (puppy) {
        setSelectedPuppy(puppy);
      } else {
        toast({
          title: "Puppy not found",
          description: "The puppy you're looking for doesn't exist in this litter",
          variant: "destructive"
        });
        navigate('/my-litters');
      }
    }
  }, [selectedLitter, puppyId, navigate]);

  const handleBack = () => {
    navigate('/my-litters');
  };

  const handleEditPuppy = async (updatedPuppy: Puppy) => {
    try {
      await handleUpdatePuppy(updatedPuppy);
      setSelectedPuppy(updatedPuppy);
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

  const getStatusBadge = (puppy: Puppy) => {
    const status = puppy.status || 'Available';
    switch (status) {
      case 'Reserved':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Reserved</Badge>;
      case 'Sold':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Sold</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Available</Badge>;
    }
  };

  const getLatestWeight = (puppy: Puppy) => {
    if (puppy.weightLog && puppy.weightLog.length > 0) {
      const sortedWeights = [...puppy.weightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedWeights[0].weight} kg`;
    }
    return puppy.currentWeight ? `${puppy.currentWeight} kg` : 'Not recorded';
  };

  const getLatestHeight = (puppy: Puppy) => {
    if (puppy.heightLog && puppy.heightLog.length > 0) {
      const sortedHeights = [...puppy.heightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedHeights[0].height} cm`;
    }
    return 'Not recorded';
  };

  const getPuppyAge = (puppy: Puppy) => {
    if (puppy.birthDateTime) {
      return differenceInWeeks(new Date(), parseISO(puppy.birthDateTime));
    }
    return selectedLitter ? differenceInWeeks(new Date(), parseISO(selectedLitter.dateOfBirth)) : 0;
  };

  if (isLoadingDetails || !selectedPuppy) {
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
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Litters
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-warmgreen-800">
            {selectedPuppy.name}
          </h1>
          <p className="text-muted-foreground">
            {selectedLitter?.name} • {puppyAge} weeks old
          </p>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Puppy
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-warmbeige-200 shadow-lg">
                {selectedPuppy.imageUrl ? (
                  <AvatarImage src={selectedPuppy.imageUrl} alt={selectedPuppy.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-warmgreen-100 text-warmgreen-800 font-medium text-3xl">
                    {selectedPuppy.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-warmgreen-800">{selectedPuppy.name}</h2>
                {getStatusBadge(selectedPuppy)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Circle className={`h-5 w-5 ${selectedPuppy.gender === 'male' ? 'text-blue-500 fill-blue-500' : 'text-pink-500 fill-pink-500'}`} />
                  <span className="font-medium capitalize">{selectedPuppy.gender}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {selectedPuppy.birthDateTime 
                      ? format(parseISO(selectedPuppy.birthDateTime), 'MMM d, yyyy')
                      : 'Birth date not set'
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measurements">Growth Charts</TabsTrigger>
          <TabsTrigger value="notes">Notes & Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Physical Details */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Birth Weight</p>
                    <p className="text-lg">{selectedPuppy.birthWeight ? `${selectedPuppy.birthWeight} kg` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Weight</p>
                    <p className="text-lg">{getLatestWeight(selectedPuppy)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Color</p>
                    <p className="text-lg">{selectedPuppy.color}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Markings</p>
                    <p className="text-lg">{selectedPuppy.markings || 'None'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Details */}
            <Card>
              <CardHeader>
                <CardTitle>Registration & Identification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Microchip</p>
                    <p className="text-lg">{selectedPuppy.microchip || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Collar</p>
                    <p className="text-lg">{selectedPuppy.collar || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Breed</p>
                    <p className="text-lg">{selectedPuppy.breed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buyer Information */}
            {(selectedPuppy.status === 'Reserved' || selectedPuppy.status === 'Sold') && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Buyer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{selectedPuppy.newOwner || 'Information not available'}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="measurements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <PuppyMeasurementsChart puppy={selectedPuppy} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes & Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPuppy.notes && selectedPuppy.notes.length > 0 ? (
                <div className="space-y-4">
                  {selectedPuppy.notes.map((note, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(note.date), 'MMM d, yyyy')}
                      </p>
                      <p>{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No notes recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditPuppyDialog
          puppy={selectedPuppy}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onUpdatePuppy={handleEditPuppy}
        />
      )}
    </div>
  );
};

export default PuppyProfile;