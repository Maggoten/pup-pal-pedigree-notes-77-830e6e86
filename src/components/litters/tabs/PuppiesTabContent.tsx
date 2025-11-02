import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO, differenceInWeeks } from 'date-fns';
import { Litter, Puppy } from '@/types/breeding';
import PuppyList from '../PuppyList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, PawPrint } from 'lucide-react';
import AddPuppyDialog from '../AddPuppyDialog';
import PuppyMeasurementsDialog from '../puppies/PuppyMeasurementsDialog';
import PuppyDetailsDialog from '../PuppyDetailsDialog';
import PuppyProfileCard from '../puppies/PuppyProfileCard';
import PuppyTableView from '../puppies/PuppyTableView';
import ViewToggle from '../ViewToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

interface PuppiesTabContentProps {
  puppies: Puppy[];
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  litterDob: string;
  damBreed?: string;
  onSelectPuppy: (puppy: Puppy | null) => void;
  selectedPuppy: Puppy | null;
  litterAge: number;
  litter: Litter;
}

const PuppiesTabContent: React.FC<PuppiesTabContentProps> = ({
  puppies,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  litterDob,
  damBreed,
  onSelectPuppy,
  selectedPuppy,
  litterAge,
  litter,
}) => {
  const { t } = useTranslation('litters');
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false);
  const [addPuppyDialogOpen, setAddPuppyDialogOpen] = useState(false);
  const [activePuppy, setActivePuppy] = useState<Puppy | null>(null);
  const [localPuppies, setLocalPuppies] = useState<Puppy[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const isMobile = useIsMobile();
  
  // Keep local state in sync with props - FIXED: Always update, even for empty arrays
  useEffect(() => {
    console.log(`PuppiesTabContent: Updating localPuppies for litter ${litter.id}:`, {
      incomingPuppies: puppies?.length || 0,
      puppiesList: puppies?.map(p => ({ id: p.id, name: p.name })) || []
    });
    
    // Always update localPuppies with the current puppies prop, even if it's empty
    setLocalPuppies(puppies || []);
  }, [puppies, litter.id]);
  
  useEffect(() => {
    console.log("PuppiesTabContent rendered with puppies:", puppies);
    if (!puppies || puppies.length === 0) {
      console.log("No puppies found in this litter");
    } else {
      console.log("Puppy details:", JSON.stringify(puppies[0], null, 2));
    }
    console.log("Dam breed:", damBreed);
  }, [puppies, damBreed]);
  
  const handleAddMeasurement = (puppy: Puppy) => {
    setActivePuppy(puppy);
    setMeasurementDialogOpen(true);
  };
  
  const getNextPuppyNumber = () => {
    return localPuppies.length + 1;
  };
  
  const handleDeletePuppy = (puppyId: string) => {
    onDeletePuppy(puppyId);
    
    // Update local state immediately for responsive UI
    setLocalPuppies(prev => prev.filter(p => p.id !== puppyId));
  };
  
  const handleAddPuppy = async (puppy: Puppy) => {
    console.log("PuppiesTabContent - Adding puppy:", puppy);
    
    // Update local state immediately for responsive UI
    setLocalPuppies(prev => [...prev, puppy]);
    
    try {
      await onAddPuppy(puppy);
      setAddPuppyDialogOpen(false);
    } catch (error) {
      console.error("Error adding puppy:", error);
      // Revert local state on error
      setLocalPuppies(puppies);
    }
  };
  
  const updatePuppyNames = (updatedPuppy: Puppy) => {
    // Update local state immediately for responsive UI
    setLocalPuppies(prev => 
      prev.map(p => p.id === updatedPuppy.id ? updatedPuppy : p)
    );
    
    onUpdatePuppy(updatedPuppy);
  };
  
  return (
    <Card className="shadow-sm bg-white border border-warmbeige-200">
      <CardHeader className={`bg-warmbeige-100 ${isMobile ? 'pb-3' : 'pb-4'}`}>
        <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-3' : ''}`}>
          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-primary" />
            <CardTitle className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
              {localPuppies && localPuppies.length > 0 
                ? t('puppies.display.puppiesCount', { count: localPuppies.length })
                : t('puppies.display.puppiesTitle')
              }
            </CardTitle>
          </div>
          
          <div className={`flex items-center gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
            <Dialog open={addPuppyDialogOpen} onOpenChange={setAddPuppyDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "sm"}
                  className={`flex items-center bg-warmbeige-50 hover:bg-warmbeige-200 ${isMobile ? 'gap-1 px-3 flex-1' : 'gap-1.5'}`}
                  onClick={() => setAddPuppyDialogOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className={isMobile ? 'text-sm' : ''}>{t('puppies.actions.addPuppy')}</span>
                </Button>
              </DialogTrigger>
              <AddPuppyDialog 
                onAddPuppy={handleAddPuppy} 
                onClose={() => setAddPuppyDialogOpen(false)}
                litterDob={litterDob} 
                damBreed={damBreed}
                puppyNumber={getNextPuppyNumber()}
              />
            </Dialog>

            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={isMobile ? 'p-4' : 'p-6'}>
        {localPuppies && localPuppies.length > 0 ? (
          view === 'grid' ? (
            <div className={`grid gap-6 ${
              isMobile 
                ? 'grid-cols-1' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {localPuppies.map((puppy) => (
                <PuppyProfileCard
                  key={puppy.id}
                  puppy={puppy}
                  onAddMeasurement={handleAddMeasurement}
                  onUpdatePuppy={updatePuppyNames}
                  onDeletePuppy={handleDeletePuppy}
                  isSelected={selectedPuppy?.id === puppy.id}
                  litterAge={litterAge}
                  litterId={litter.id}
                />
              ))}
            </div>
          ) : (
            <div className={isMobile ? 'overflow-x-auto -mx-4 px-4' : ''}>
              <PuppyTableView
                puppies={localPuppies}
                onAddMeasurement={handleAddMeasurement}
                onUpdatePuppy={updatePuppyNames}
                onDeletePuppy={handleDeletePuppy}
                selectedPuppyId={selectedPuppy?.id}
                litterDob={litterDob}
                litterId={litter.id}
              />
            </div>
          )
        ) : (
          <div className={`text-center space-y-4 ${isMobile ? 'py-8' : 'py-12'}`}>
            <div className={`bg-warmbeige-100 rounded-full flex items-center justify-center mx-auto ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}>
              <PawPrint className={`text-warmbeige-400 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} />
            </div>
            <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>{t('puppies.empty.title')}</h3>
            <p className={`text-muted-foreground max-w-md mx-auto ${isMobile ? 'text-sm px-4' : ''}`}>
              {t('puppies.empty.description')}
            </p>
          </div>
        )}
      </CardContent>
      
      <Dialog open={measurementDialogOpen} onOpenChange={setMeasurementDialogOpen}>
        {activePuppy && (
          <PuppyMeasurementsDialog 
            puppy={activePuppy} 
            onClose={() => setMeasurementDialogOpen(false)} 
            onUpdate={updatePuppyNames}
          />
        )}
      </Dialog>
    </Card>
  );
};

export default PuppiesTabContent;
