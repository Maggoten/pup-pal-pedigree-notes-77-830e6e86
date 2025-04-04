
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Dog, 
  Edit,
  Calendar,
  List,
  Grid2X2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  CategoryTabsList, 
  CategoryTabsTrigger 
} from '@/components/ui/tabs';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { plannedLitterService } from '@/services/PlannedLitterService';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import AddLitterDialog from '@/components/litters/AddLitterDialog';
import EmptyLitterState from '@/components/litters/EmptyLitterState';
import LitterDetails from '@/components/litters/LitterDetails';
import LitterSearchForm from '@/components/litters/LitterSearchForm';
import LitterEditDialog from '@/components/litters/LitterEditDialog';
import LitterCard from '@/components/litters/LitterCard';
import YearFilterDropdown from '@/components/litters/YearFilterDropdown';
import ViewToggle from '@/components/litters/ViewToggle';

const MyLitters: React.FC = () => {
  // State for litters data
  const [activeLitters, setActiveLitters] = useState<Litter[]>([]);
  const [archivedLitters, setArchivedLitters] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  
  // UI state
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
  const [plannedLitters, setPlannedLitters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState('active');
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  // Pagination
  const [activePage, setActivePage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  
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
    
    const updatedLitters = litterService.addLitter(newLitter);
    setActiveLitters(litterService.getActiveLitters());
    setSelectedLitterId(newLitter.id);
    
    toast({
      title: "Litter Added",
      description: `${newLitter.name} has been added successfully.`
    });
  };
  
  const handleUpdateLitter = (updatedLitter: Litter) => {
    const updatedLitters = litterService.updateLitter(updatedLitter);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: "Litter Updated",
      description: `${updatedLitter.name} has been updated successfully.`
    });
    
    setShowEditLitterDialog(false);
  };
  
  const handleAddPuppy = (newPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.addPuppy(selectedLitterId, newPuppy);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: "Puppy Added",
      description: `${newPuppy.name} has been added to the litter.`
    });
  };
  
  const handleUpdatePuppy = (updatedPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.updatePuppy(selectedLitterId, updatedPuppy);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
  };

  const handleDeletePuppy = (puppyId: string) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.deletePuppy(selectedLitterId, puppyId);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
  };

  const handleDeleteLitter = (litterId: string) => {
    if (confirm('Are you sure you want to delete this litter? This action cannot be undone.')) {
      const updatedLitters = litterService.deleteLitter(litterId);
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
      
      setShowEditLitterDialog(false);
    }
  };
  
  const handleArchiveLitter = (litterId: string, archive: boolean) => {
    const updatedLitters = litterService.toggleArchiveLitter(litterId, archive);
    setActiveLitters(litterService.getActiveLitters());
    setArchivedLitters(litterService.getArchivedLitters());
    
    toast({
      title: archive ? "Litter Archived" : "Litter Activated",
      description: archive 
        ? "The litter has been moved to the archive." 
        : "The litter has been moved to active litters."
    });
    
    setShowEditLitterDialog(false);
  };
  
  // Filter and search functions
  const filterLittersByYear = (litters: Litter[]) => {
    if (!filterYear) return litters;
    
    return litters.filter(litter => {
      const birthDate = new Date(litter.dateOfBirth);
      return birthDate.getFullYear() === filterYear;
    });
  };
  
  const searchLitters = (litters: Litter[]) => {
    if (!searchQuery.trim()) return litters;
    
    const searchTermLower = searchQuery.toLowerCase();
    return litters.filter(litter => (
      litter.name.toLowerCase().includes(searchTermLower) ||
      litter.sireName.toLowerCase().includes(searchTermLower) ||
      litter.damName.toLowerCase().includes(searchTermLower)
    ));
  };
  
  // Combine filtering and searching
  const filteredActiveLitters = searchLitters(filterLittersByYear(activeLitters));
  const filteredArchivedLitters = searchLitters(filterLittersByYear(archivedLitters));
  
  // Get available years for filtering
  const getAvailableYears = () => {
    const yearsSet = new Set<number>();
    
    [...activeLitters, ...archivedLitters].forEach(litter => {
      const year = new Date(litter.dateOfBirth).getFullYear();
      yearsSet.add(year);
    });
    
    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  };
  
  // Calculate pagination
  const paginateActiveLitters = filteredActiveLitters.slice(
    (activePage - 1) * ITEMS_PER_PAGE, 
    activePage * ITEMS_PER_PAGE
  );
  
  const paginateArchivedLitters = filteredArchivedLitters.slice(
    (archivedPage - 1) * ITEMS_PER_PAGE, 
    archivedPage * ITEMS_PER_PAGE
  );
  
  const activePageCount = Math.ceil(filteredActiveLitters.length / ITEMS_PER_PAGE);
  const archivedPageCount = Math.ceil(filteredArchivedLitters.length / ITEMS_PER_PAGE);
  
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
          
          <div className="flex items-center gap-2 self-end">
            <LitterSearchForm 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            
            <YearFilterDropdown
              years={getAvailableYears()}
              selectedYear={filterYear}
              onYearChange={setFilterYear}
            />
            
            <ViewToggle 
              view={view}
              onViewChange={setView}
            />
            
            <Dialog open={showAddLitterDialog} onOpenChange={setShowAddLitterDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 ml-2">
                  <PlusCircle className="h-4 w-4" />
                  Add New Litter
                </Button>
              </DialogTrigger>
              <AddLitterDialog 
                onClose={() => setShowAddLitterDialog(false)} 
                onSubmit={handleAddLitter}
                plannedLitters={plannedLitters}
              />
            </Dialog>
          </div>
        </div>
        
        <TabsContent value="active" className="space-y-6">
          {filteredActiveLitters.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginateActiveLitters.map(litter => (
                    <LitterCard 
                      key={litter.id}
                      litter={litter}
                      onSelect={handleSelectLitter}
                      onArchive={(litter) => handleArchiveLitter(litter.id, true)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Tabs value={selectedLitterId || ''} onValueChange={setSelectedLitterId} className="space-y-4">
                    <TabsList className="w-full justify-start overflow-auto border p-2 rounded-lg bg-muted/50">
                      {paginateActiveLitters.map(litter => (
                        <TabsTrigger 
                          key={litter.id} 
                          value={litter.id} 
                          className="px-6 py-2 font-medium rounded-md relative"
                        >
                          <span className="text-primary font-semibold">{litter.name}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}
              
              {activePageCount > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setActivePage(p => Math.max(1, p - 1))}
                        className={activePage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: activePageCount }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={activePage === i + 1}
                          onClick={() => setActivePage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setActivePage(p => Math.min(activePageCount, p + 1))}
                        className={activePage === activePageCount ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : searchQuery || filterYear ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No matching litters found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          ) : (
            <EmptyLitterState onAddLitter={() => setShowAddLitterDialog(true)} />
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-6">
          {filteredArchivedLitters.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginateArchivedLitters.map(litter => (
                    <LitterCard 
                      key={litter.id}
                      litter={litter}
                      onSelect={handleSelectLitter}
                      onArchive={(litter) => handleArchiveLitter(litter.id, false)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Tabs value={selectedLitterId || ''} onValueChange={setSelectedLitterId} className="space-y-4">
                    <TabsList className="w-full justify-start overflow-auto border p-2 rounded-lg bg-muted/50">
                      {paginateArchivedLitters.map(litter => (
                        <TabsTrigger 
                          key={litter.id} 
                          value={litter.id} 
                          className="px-6 py-2 font-medium rounded-md relative"
                        >
                          <span className="font-semibold">{litter.name}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}
              
              {archivedPageCount > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setArchivedPage(p => Math.max(1, p - 1))}
                        className={archivedPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: archivedPageCount }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={archivedPage === i + 1}
                          onClick={() => setArchivedPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setArchivedPage(p => Math.min(archivedPageCount, p + 1))}
                        className={archivedPage === archivedPageCount ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : searchQuery || filterYear ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No matching archived litters found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No archived litters</h3>
              <p className="text-muted-foreground">
                You can archive litters you no longer actively work with
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {selectedLitter && (
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Selected Litter: {selectedLitter.name}
            </h2>
            
            <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Litter Details
                </Button>
              </DialogTrigger>
              <LitterEditDialog 
                litter={selectedLitter}
                onClose={() => setShowEditLitterDialog(false)}
                onUpdate={handleUpdateLitter}
                onDelete={handleDeleteLitter}
                onArchive={handleArchiveLitter}
              />
            </Dialog>
          </div>
          
          <LitterDetails
            litter={selectedLitter}
            onAddPuppy={handleAddPuppy}
            onUpdatePuppy={handleUpdatePuppy}
            onDeletePuppy={handleDeletePuppy}
          />
        </div>
      )}
    </PageLayout>
  );
};

export default MyLitters;
