
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Dog } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  Tabs, 
  TabsContent, 
  CategoryTabsList, 
  CategoryTabsTrigger 
} from '@/components/ui/tabs';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { plannedLitterService } from '@/services/PlannedLitterService';

import { LitterFilterProvider, useLitterFilters } from '@/components/litters/LitterFilterProvider';
import LitterFilterControls from '@/components/litters/LitterFilterControls';
import LitterTabContent from '@/components/litters/LitterTabContent';
import SelectedLitterSection from '@/components/litters/SelectedLitterSection';
import useLitterFiltering from '@/hooks/useLitterFiltering';

const ITEMS_PER_PAGE = 12;

const MyLittersContent: React.FC = () => {
  // State for litters data
  const [activeLitters, setActiveLitters] = useState<Litter[]>([]);
  const [archivedLitters, setArchivedLitters] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  
  // UI state
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  const [plannedLitters, setPlannedLitters] = useState([]);
  
  // Get filter state from context
  const { 
    searchQuery, 
    filterYear, 
    categoryTab, 
    setCategoryTab,
    activePage,
    setActivePage,
    archivedPage,
    setArchivedPage
  } = useLitterFilters();
  
  // Filter and paginate litters
  const {
    filteredLitters: filteredActiveLitters,
    paginatedLitters: paginateActiveLitters,
    pageCount: activePageCount
  } = useLitterFiltering(activeLitters, searchQuery, filterYear, activePage, ITEMS_PER_PAGE);
  
  const {
    filteredLitters: filteredArchivedLitters,
    paginatedLitters: paginateArchivedLitters,
    pageCount: archivedPageCount
  } = useLitterFiltering(archivedLitters, searchQuery, filterYear, archivedPage, ITEMS_PER_PAGE);
  
  // Load litters on component mount
  useEffect(() => {
    const loadLitters = () => {
      const active = litterService.getActiveLitters();
      const archived = litterService.getArchivedLitters();
      
      // Sort litters by date (newest first)
      const sortByDate = (a: Litter, b: Litter) => 
        new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime();
      
      setActiveLitters(active.sort(sortByDate));
      setArchivedLitters(archived.sort(sortByDate));
      
      // Select the newest active litter by default
      if (active.length > 0 && !selectedLitterId) {
        setSelectedLitterId(active[0].id);
      } else if (active.length === 0 && archived.length > 0) {
        setSelectedLitterId(archived[0].id);
      }
    };
    
    loadLitters();
    
    const loadedPlannedLitters = plannedLitterService.loadPlannedLitters();
    setPlannedLitters(loadedPlannedLitters);
  }, []);
  
  // Handlers for litter operations
  const handleAddLitter = (newLitter: Litter) => {
    newLitter.puppies = [];
    newLitter.archived = false;
    
    litterService.addLitter(newLitter);
    setActiveLitters(litterService.getActiveLitters());
    setSelectedLitterId(newLitter.id);
    
    toast({
      title: "Litter Added",
      description: `${newLitter.name} has been added successfully.`
    });
  };
  
  const handleUpdateLitter = (updatedLitter: Litter) => {
    litterService.updateLitter(updatedLitter);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: "Litter Updated",
      description: `${updatedLitter.name} has been updated successfully.`
    });
  };
  
  const handleAddPuppy = (newPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    litterService.addPuppy(selectedLitterId, newPuppy);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: "Puppy Added",
      description: `${newPuppy.name} has been added to the litter.`
    });
  };
  
  const handleUpdatePuppy = (updatedPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    litterService.updatePuppy(selectedLitterId, updatedPuppy);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
  };

  const handleDeletePuppy = (puppyId: string) => {
    if (!selectedLitterId) return;
    
    litterService.deletePuppy(selectedLitterId, puppyId);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
  };

  const handleDeleteLitter = (litterId: string) => {
    if (confirm('Are you sure you want to delete this litter? This action cannot be undone.')) {
      litterService.deleteLitter(litterId);
      setActiveLitters(litterService.getActiveLitters());
      setArchivedLitters(litterService.getArchivedLitters());
      
      // Select new litter if the deleted one was selected
      if (selectedLitterId === litterId) {
        if (categoryTab === 'active' && activeLitters.length > 0) {
          setSelectedLitterId(activeLitters[0].id);
        } else if (archivedLitters.length > 0) {
          setSelectedLitterId(archivedLitters[0].id);
        } else {
          setSelectedLitterId(null);
        }
      }
      
      toast({
        title: "Litter Deleted",
        description: "The litter has been deleted successfully.",
        variant: "destructive"
      });
    }
  };
  
  const handleArchiveLitter = (litterId: string, archive: boolean) => {
    litterService.toggleArchiveLitter(litterId, archive);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: archive ? "Litter Archived" : "Litter Activated",
      description: archive 
        ? "The litter has been moved to the archive." 
        : "The litter has been moved to active litters."
    });
  };
  
  // Get available years for filtering
  const getAvailableYears = () => {
    const yearsSet = new Set<number>();
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  };
  
  // Find the currently selected litter
  const selectedLitter = selectedLitterId 
    ? [...activeLitters, ...archivedLitters].find(litter => litter.id === selectedLitterId) 
    : null;
  
  // Handle selecting a litter
  const handleSelectLitter = (litter: Litter) => {
    setSelectedLitterId(litter.id);
  };
  
  return (
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<Dog className="h-6 w-6" />}
    >
      <Tabs value={categoryTab} onValueChange={setCategoryTab} className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <CategoryTabsList>
            <CategoryTabsTrigger value="active" className="relative">
              Active Litters
              {activeLitters.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
                  {activeLitters.length}
                </span>
              )}
            </CategoryTabsTrigger>
            <CategoryTabsTrigger value="archived" className="relative">
              Archived Litters
              {archivedLitters.length > 0 && (
                <span className="ml-2 bg-muted text-muted-foreground text-xs rounded-full h-5 min-w-5 inline-flex items-center justify-center px-1.5">
                  {archivedLitters.length}
                </span>
              )}
            </CategoryTabsTrigger>
          </CategoryTabsList>
          
          <LitterFilterControls
            showAddLitterDialog={showAddLitterDialog}
            setShowAddLitterDialog={setShowAddLitterDialog}
            onAddLitter={handleAddLitter}
            plannedLitters={plannedLitters}
            availableYears={getAvailableYears()}
          />
        </div>
        
        <TabsContent value="active" className="space-y-6">
          <LitterTabContent
            litters={activeLitters}
            filteredLitters={filteredActiveLitters}
            paginatedLitters={paginateActiveLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={handleSelectLitter}
            onSelectLitterId={setSelectedLitterId}
            onArchive={(litter) => handleArchiveLitter(litter.id, true)}
            onAddLitter={() => setShowAddLitterDialog(true)}
            pageCount={activePageCount}
            currentPage={activePage}
            setCurrentPage={setActivePage}
            isArchived={false}
            searchQuery={searchQuery}
            filterYear={filterYear}
          />
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-6">
          <LitterTabContent
            litters={archivedLitters}
            filteredLitters={filteredArchivedLitters}
            paginatedLitters={paginateArchivedLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={handleSelectLitter}
            onSelectLitterId={setSelectedLitterId}
            onArchive={(litter) => handleArchiveLitter(litter.id, false)}
            onAddLitter={() => setShowAddLitterDialog(true)}
            pageCount={archivedPageCount}
            currentPage={archivedPage}
            setCurrentPage={setArchivedPage}
            isArchived={true}
            searchQuery={searchQuery}
            filterYear={filterYear}
          />
        </TabsContent>
      </Tabs>
      
      <SelectedLitterSection
        selectedLitter={selectedLitter}
        onUpdateLitter={handleUpdateLitter}
        onDeleteLitter={handleDeleteLitter}
        onArchiveLitter={handleArchiveLitter}
        onAddPuppy={handleAddPuppy}
        onUpdatePuppy={handleUpdatePuppy}
        onDeletePuppy={handleDeletePuppy}
      />
    </PageLayout>
  );
};

const MyLitters: React.FC = () => {
  return (
    <LitterFilterProvider>
      <MyLittersContent />
    </LitterFilterProvider>
  );
};

export default MyLitters;
