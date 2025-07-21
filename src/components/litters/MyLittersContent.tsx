import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useLitterFilter } from './LitterFilterProvider';
import useLitterManagement from '@/hooks/litters/useLitterManagement';
import useLitterFilteredData from '@/hooks/useLitterFilteredData';
import AddLitterDialog from './AddLitterDialog';
import LitterTabContent from './tabs/LitterTabContent';
import SelectedLitterSection from './SelectedLitterSection';
import SelectedLitterHeader from './SelectedLitterHeader';
import { dogImageService } from '@/services/dogImageService';

const MyLittersContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [showFilters, setShowFilters] = useState(false);
  const { searchQuery, setSearchQuery, clearFilters, activePage, setActivePage, archivedPage, setArchivedPage } = useLitterFilter();
  const {
    activeLitters,
    archivedLitters,
    selectedLitterId,
    setSelectedLitterId,
    plannedLitters,
    showAddLitterDialog,
    setShowAddLitterDialog,
    selectedLitter,
    isLoading,
    isLoadingDetails,
    isLoadingPlannedLitters,
    handleAddLitter,
    handleUpdateLitter,
    handleAddPuppy,
    handleUpdatePuppy,
    handleDeletePuppy,
    handleDeleteLitter,
    handleArchiveLitter,
    handleSelectLitter,
    getAvailableYears,
    refreshPlannedLitters,
    refreshLitters
  } = useLitterManagement();
  const {
    filteredActiveLitters,
    paginatedActiveLitters,
    activePageCount,
    filteredArchivedLitters,
    paginatedArchivedLitters,
    archivedPageCount,
    isFilterActive
  } = useLitterFilteredData(activeLitters, archivedLitters);
  const [selectedLitterDamImage, setSelectedLitterDamImage] = useState<string | null>(null);
  
  // Fetch dam image for selected litter
  useEffect(() => {
    const fetchSelectedLitterDamImage = async () => {
      if (!selectedLitter?.damId) {
        setSelectedLitterDamImage(null);
        return;
      }
      
      const images = await dogImageService.getDogImages([selectedLitter.damId]);
      setSelectedLitterDamImage(images[selectedLitter.damId] || null);
    };

    fetchSelectedLitterDamImage();
  }, [selectedLitter?.damId]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search litters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <Button onClick={() => setShowAddLitterDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Litter
        </Button>
      </div>

      {/* Selected Litter Section */}
      {selectedLitter && (
        <div className="space-y-4">
          <SelectedLitterHeader 
            litter={selectedLitter} 
            damImageUrl={selectedLitterDamImage}
          />
          <SelectedLitterSection 
            litter={selectedLitter} 
            onUpdateLitter={handleUpdateLitter}
            onAddPuppy={handleAddPuppy}
            onUpdatePuppy={handleUpdatePuppy}
            onDeletePuppy={handleDeletePuppy}
          />
        </div>
      )}

      {/* Litter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Litters ({activeLitters.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived Litters ({archivedLitters.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <LitterTabContent
            litters={activeLitters}
            filteredLitters={filteredActiveLitters}
            paginatedLitters={paginatedActiveLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={handleSelectLitter}
            onAddLitter={() => setShowAddLitterDialog(true)}
            onArchive={handleArchiveLitter}
            pageCount={activePageCount}
            currentPage={activePage}
            onPageChange={setActivePage}
            isFilterActive={isFilterActive}
            onClearFilter={clearFilters}
          />
        </TabsContent>
        
        <TabsContent value="archived" className="mt-6">
          <LitterTabContent
            litters={archivedLitters}
            filteredLitters={filteredArchivedLitters}
            paginatedLitters={paginatedArchivedLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={handleSelectLitter}
            onAddLitter={() => setShowAddLitterDialog(true)}
            onArchive={handleArchiveLitter}
            pageCount={archivedPageCount}
            currentPage={archivedPage}
            onPageChange={setArchivedPage}
            isFilterActive={isFilterActive}
            onClearFilter={clearFilters}
          />
        </TabsContent>
      </Tabs>

      {/* Add Litter Dialog */}
      <Dialog open={showAddLitterDialog} onOpenChange={setShowAddLitterDialog}>
        <AddLitterDialog 
          onAddLitter={handleAddLitter}
          onClose={() => setShowAddLitterDialog(false)}
        />
      </Dialog>
    </div>
  );
};

export default MyLittersContent;
