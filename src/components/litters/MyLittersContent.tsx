
import React, { useState, useEffect, useCallback } from 'react';
import { useLitterManagement } from '@/hooks/litters/useLitterManagement';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Litter } from '@/types/breeding';
import LitterGridView from './LitterGridView';
import LitterListView from './LitterListView';
import EmptyLitterState from './EmptyLitterState';
import AddLitterDialog from './AddLitterDialog';
import { useLitterFiltering } from '@/hooks/useLitterFiltering';
import LitterFilterHeader from './filters/LitterFilterHeader';
import SelectedLitterSection from './SelectedLitterSection';
import { ViewType } from './LitterFilterProvider';
import { Separator } from '@/components/ui/separator';
import { useQueryClient } from '@tanstack/react-query';
import { littersQueryKey } from '@/hooks/litters/queries/useAddLitterMutation';

const MyLittersContent: React.FC = () => {
  // Track view mode locally
  const [view, setView] = useState<ViewType>('grid');
  // Update the type of categoryTab to match what LitterFilterHeader expects
  const [categoryTab, setCategoryTab] = useState<'active' | 'archived'>('active');
  const queryClient = useQueryClient();
  
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
    getAvailableYears,
    plannedLitters,
    refreshPlannedLitters,
    refreshLitters
  } = useLitterManagement();

  // Use litter filtering - explicitly pass the active or archived litters based on tab
  const littersToFilter = categoryTab === 'active' ? activeLitters : archivedLitters;
  const {
    filteredLitters,
    searchQuery,
    setSearchQuery,
    selectedYear,
    setSelectedYear
  } = useLitterFiltering(littersToFilter, getAvailableYears);

  // Determine if there are no litters at all (for empty state)
  const hasNoLitters = !isLoading && activeLitters.length === 0 && archivedLitters.length === 0;

  // Helper to handle archive actions for LitterGridView/ListView
  const handleArchive = (litter: Litter) => {
    handleArchiveLitter(litter.id, !litter.archived);
  };

  // Enhanced add litter handler to ensure UI updates
  const handleAddLitterWithRefresh = useCallback(async (litter: Litter) => {
    try {
      await handleAddLitter(litter);
      
      // Ensure queries are invalidated after adding a litter
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
      
      // Force a manual refresh to update the UI
      setTimeout(() => {
        refreshLitters();
      }, 500);
      
    } catch (error) {
      console.error("Error in handleAddLitterWithRefresh:", error);
    }
  }, [handleAddLitter, queryClient, refreshLitters]);

  // When dialog opens, refresh planned litters to ensure we have the latest data
  useEffect(() => {
    if (showAddLitterDialog) {
      console.log("Add litter dialog opened, refreshing planned litters");
      refreshPlannedLitters();
    }
  }, [showAddLitterDialog, refreshPlannedLitters]);

  // Create a wrapper function to handle type conversion for setCategoryTab
  const handleCategoryTabChange = (value: string) => {
    if (value === 'active' || value === 'archived') {
      setCategoryTab(value);
    }
  };

  // Clear filters function
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedYear(null);
  };

  // Initial data load and periodic refresh
  useEffect(() => {
    // Set up interval for periodic UI refresh
    const refreshInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [queryClient]);

  console.log("Rendering MyLittersContent with planned litters:", plannedLitters?.length || 0);

  return (
    <div className="container py-0">
      <div className="space-y-6">
        {/* Header with filter controls */}
        <div className="flex flex-col space-y-4">
          <Separator className="bg-warmbeige-100" />
        </div>
        
        <LitterFilterHeader 
          activeLitters={activeLitters} 
          archivedLitters={archivedLitters} 
          categoryTab={categoryTab} 
          setCategoryTab={handleCategoryTabChange} 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          selectedYear={selectedYear} 
          onYearChange={setSelectedYear} 
          onAddLitterClick={() => setShowAddLitterDialog(true)} 
          availableYears={getAvailableYears()} 
        />

        {/* No litters empty state */}
        {hasNoLitters ? (
          <EmptyLitterState onAddLitter={() => setShowAddLitterDialog(true)} />
        ) : (
          <Tabs value={categoryTab} onValueChange={handleCategoryTabChange} className="w-full space-y-6">
            <TabsContent value="active" className="m-0">
              {/* Litters List Section */}
              <Card className="shadow-sm rounded-2xl overflow-hidden border border-warmbeige-100 bg-white">
                <div className="p-5">
                  {view === 'grid' ? (
                    <LitterGridView 
                      litters={filteredLitters} 
                      onSelectLitter={handleSelectLitter} 
                      onArchive={handleArchive} 
                      selectedLitterId={selectedLitterId} 
                      loadingMore={false} 
                      hasMore={false} 
                    />
                  ) : (
                    <LitterListView 
                      litters={filteredLitters} 
                      onSelectLitter={handleSelectLitter} 
                      onArchive={handleArchive} 
                      selectedLitterId={selectedLitterId} 
                    />
                  )}
                  
                  {/* Empty filtered results message */}
                  {filteredLitters.length === 0 && (searchQuery || selectedYear) && (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium mb-2 text-darkgray-600">No litters found</h3>
                      <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                      <button 
                        onClick={handleClearFilters} 
                        className="px-4 py-2 bg-warmgreen-600 text-white rounded-xl hover:bg-warmgreen-700 transition-colors shadow-sm"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Selected Litter Details Section */}
              {selectedLitter && (
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
              )}
            </TabsContent>

            <TabsContent value="archived" className="m-0">
              {/* Archived Litters Section - Same structure as active */}
              <Card className="shadow-sm rounded-2xl overflow-hidden border border-warmbeige-100 bg-white">
                <div className="p-5">
                  {view === 'grid' ? (
                    <LitterGridView 
                      litters={filteredLitters} 
                      onSelectLitter={handleSelectLitter} 
                      onArchive={handleArchive} 
                      selectedLitterId={selectedLitterId} 
                      loadingMore={false} 
                      hasMore={false} 
                    />
                  ) : (
                    <LitterListView 
                      litters={filteredLitters} 
                      onSelectLitter={handleSelectLitter} 
                      onArchive={handleArchive} 
                      selectedLitterId={selectedLitterId} 
                    />
                  )}
                  
                  {/* Empty filtered results message */}
                  {filteredLitters.length === 0 && (searchQuery || selectedYear) && (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium mb-2 text-darkgray-600">No litters found</h3>
                      <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                      <button 
                        onClick={handleClearFilters} 
                        className="px-4 py-2 bg-warmgreen-600 text-white rounded-xl hover:bg-warmgreen-700 transition-colors shadow-sm"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Selected Litter Details Section */}
              {selectedLitter && (
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
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Add Litter Dialog */}
      <AddLitterDialog 
        open={showAddLitterDialog} 
        onOpenChange={setShowAddLitterDialog} 
        onAddLitter={handleAddLitterWithRefresh} 
        plannedLitters={plannedLitters || []} 
      />
    </div>
  );
};

export default MyLittersContent;
