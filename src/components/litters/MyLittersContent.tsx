
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

import { toast } from '@/components/ui/use-toast';
import { useLitterFilter } from './LitterFilterProvider';
import useLitterManagement from '@/hooks/litters/useLitterManagement';
import useLitterFilteredData from '@/hooks/useLitterFilteredData';
import AddLitterDialog from './AddLitterDialog';
import LitterFilterBar from './LitterFilterBar';
import LitterTabContent from './tabs/LitterTabContent';
import SelectedLitterSection from './SelectedLitterSection';
import SelectedLitterHeader from './SelectedLitterHeader';
import { dogImageService } from '@/services/dogImageService';
import ArchivedLitterSummary from './archived/ArchivedLitterSummary';

const MyLittersContent: React.FC = () => {
  const { t } = useTranslation('litters');
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage } = useLitterFilter();
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

  // Combine all litters for unified filtering
  const allLitters = [...activeLitters, ...archivedLitters];

  const {
    filteredLitters,
    paginatedLitters,
    pageCount,
    isFilterActive
  } = useLitterFilteredData(allLitters);

  // Check for selected litter in URL parameters on mount
  useEffect(() => {
    const selectedFromUrl = searchParams.get('selected');
    if (selectedFromUrl && !selectedLitterId) {
      // Find the litter in our data
      const litterExists = allLitters.find(litter => litter.id === selectedFromUrl);
      if (litterExists) {
        console.log(`MyLittersContent: Auto-selecting litter from URL: ${selectedFromUrl}`);
        handleSelectLitter(litterExists);
        // Clean up the URL parameter after selection
        setSearchParams(params => {
          params.delete('selected');
          return params;
        });
      }
    }
  }, [searchParams, selectedLitterId, allLitters, handleSelectLitter, setSearchParams]);

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
      {/* Main Litters Card */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {t('pages.myLitters.title')}
            </span>
            <Button onClick={() => setShowAddLitterDialog(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('actions.addLitter')}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Bar */}
          <LitterFilterBar
            activeCount={activeLitters.length}
            archivedCount={archivedLitters.length}
            totalCount={allLitters.length}
          />

          {/* Litter Content */}
          <LitterTabContent
            litters={allLitters}
            filteredLitters={filteredLitters}
            paginatedLitters={paginatedLitters}
            selectedLitterId={selectedLitterId}
            onSelectLitter={handleSelectLitter}
            onAddLitter={() => setShowAddLitterDialog(true)}
            onArchive={(litter) => handleArchiveLitter(litter.id, !litter.archived)}
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isFilterActive={isFilterActive}
            onClearFilter={() => setSearchQuery('')}
          />
        </CardContent>
      </Card>

      {/* Selected Litter Section */}
      {selectedLitter && (
        <div className="space-y-4">
          {/* Show archived summary for archived litters */}
          {selectedLitter.archived ? (
            <ArchivedLitterSummary litterId={selectedLitter.id} />
          ) : (
            <>
              <SelectedLitterHeader 
                litter={selectedLitter} 
                damImageUrl={selectedLitterDamImage}
                onUpdateLitter={handleUpdateLitter}
                onDeleteLitter={handleDeleteLitter}
                onArchiveLitter={handleArchiveLitter}
              />
              <SelectedLitterSection 
                litter={selectedLitter} 
                onUpdateLitter={handleUpdateLitter}
                onAddPuppy={handleAddPuppy}
                onUpdatePuppy={handleUpdatePuppy}
                onDeletePuppy={handleDeletePuppy}
                onDeleteLitter={handleDeleteLitter}
                onArchiveLitter={handleArchiveLitter}
              />
            </>
          )}
        </div>
      )}

      {/* Add Litter Dialog */}
      <AddLitterDialog 
        open={showAddLitterDialog}
        onOpenChange={setShowAddLitterDialog}
        onAddLitter={handleAddLitter}
        plannedLitters={plannedLitters}
      />
    </div>
  );
};

export default MyLittersContent;
