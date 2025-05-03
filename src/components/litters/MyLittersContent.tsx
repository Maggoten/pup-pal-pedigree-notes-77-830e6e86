
import React, { useState, useMemo } from 'react';
import { Grid2X2, LayoutList } from 'lucide-react';
import { useLitterManagement } from '@/hooks/litters/useLitterManagement';
import { useLitterFiltering } from '@/hooks/useLitterFiltering';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Litter } from '@/types/breeding';
import LitterGridView from './LitterGridView';
import LitterListView from './LitterListView';
import LitterFilterControls from './LitterFilterControls';
import SelectedLitterSection from './SelectedLitterSection';
import EmptyLitterState from './EmptyLitterState';
import AddLitterDialog from './AddLitterDialog'; 

const MyLittersContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const {
    activeLitters,
    archivedLitters,
    selectedLitterId,
    selectedLitter,
    isLoading,
    isLoadingDetails,
    showAddLitterDialog,
    setShowAddLitterDialog,
    handleAddLitter,
    handleUpdateLitter,
    handleSelectLitter,
    handleAddPuppy,
    handleUpdatePuppy,
    handleDeletePuppy,
    handleDeleteLitter,
    handleArchiveLitter,
    getAvailableYears
  } = useLitterManagement();

  // Use litter filtering
  const { 
    filteredActiveLitters, 
    filteredArchivedLitters,
    activeTab, 
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedYear,
    setSelectedYear 
  } = useLitterFiltering(activeLitters, archivedLitters, getAvailableYears);

  // Toggle view mode
  const toggleViewMode = (value: string) => {
    if (value === 'grid' || value === 'list') {
      setViewMode(value);
    }
  };

  // Get the litters to display based on active tab
  const littersToDisplay = useMemo(() => {
    return activeTab === 'active' ? filteredActiveLitters : filteredArchivedLitters;
  }, [activeTab, filteredActiveLitters, filteredArchivedLitters]);

  // Determine if there are no litters at all (for empty state)
  const hasNoLitters = !isLoading && activeLitters.length === 0 && archivedLitters.length === 0;

  // Helper to handle archive actions for LitterGridView
  const handleArchive = (litter: Litter) => {
    handleArchiveLitter(litter.id, !litter.archived);
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        {/* Litter Filter Controls Row */}
        <LitterFilterControls 
          hasLitters={activeLitters.length > 0 || archivedLitters.length > 0}
          onAddLitterClick={() => setShowAddLitterDialog(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={getAvailableYears()}
        />

        {/* No litters empty state */}
        {hasNoLitters ? (
          <EmptyLitterState onAddLitter={() => setShowAddLitterDialog(true)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Litters Column - 1/3 width on large screens */}
            <div className="lg:col-span-1">
              <Card>
                {/* Tab Navigation and View Toggle */}
                <div className="flex items-center justify-between p-4 border-b">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="active">
                        Active ({filteredActiveLitters.length})
                      </TabsTrigger>
                      <TabsTrigger value="archived">
                        Archived ({filteredArchivedLitters.length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="ml-4">
                    <ToggleGroup type="single" value={viewMode} onValueChange={toggleViewMode}>
                      <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
                        <Grid2X2 className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="list" aria-label="List view" size="sm">
                        <LayoutList className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>

                {/* Litter List/Grid */}
                <div className="p-4">
                  {viewMode === 'grid' ? (
                    <LitterGridView 
                      litters={littersToDisplay} 
                      onSelectLitter={handleSelectLitter}
                      onArchive={handleArchive}
                      selectedLitterId={selectedLitterId}
                      loadingMore={false}
                      hasMore={false}
                    />
                  ) : (
                    <LitterListView 
                      litters={littersToDisplay} 
                      onSelectLitter={handleSelectLitter} 
                      selectedLitterId={selectedLitterId}
                    />
                  )}
                </div>
              </Card>
            </div>

            {/* Selected Litter Column - 2/3 width on large screens */}
            <div className="lg:col-span-2">
              {selectedLitter ? (
                <SelectedLitterSection 
                  litter={selectedLitter}
                  onUpdateLitter={handleUpdateLitter}
                  onAddPuppy={handleAddPuppy}
                  onUpdatePuppy={handleUpdatePuppy}
                  onDeletePuppy={handleDeletePuppy}
                  onDeleteLitter={handleDeleteLitter}
                  onArchiveLitter={handleArchiveLitter}
                  isLoadingDetails={isLoadingDetails}
                />
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">Select a litter to view its details</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Litter Dialog */}
      <AddLitterDialog
        open={showAddLitterDialog}
        onOpenChange={setShowAddLitterDialog}
        onAddLitter={handleAddLitter}
      />
    </div>
  );
};

export default MyLittersContent;
