
import { useLitterCore } from './operations/useLitterCore';
import { useAddLitter } from './operations/useAddLitter';
import { usePuppyOperations } from './operations/usePuppyOperations';

export function useLitterOperations(
  loadLittersData: () => Promise<unknown>,
  loadLitterDetails: (litterId: string) => Promise<void>,
  setActiveLitters,
  setArchivedLitters,
  setSelectedLitterId,
  activeLitters,
  archivedLitters,
  selectedLitterId
) {
  // Use specialized hooks for each operation category
  const { updateLitter, deleteLitter, archiveLitter } = useLitterCore(
    loadLittersData,
    loadLitterDetails,
    setActiveLitters,
    setArchivedLitters,
    setSelectedLitterId,
    activeLitters,
    archivedLitters
  );
  
  const handleAddLitter = useAddLitter(
    loadLittersData,
    setActiveLitters,
    setArchivedLitters,
    setSelectedLitterId
  );
  
  const { addPuppy, updatePuppy, deletePuppy } = usePuppyOperations(
    loadLittersData,
    loadLitterDetails
  );

  return {
    handleAddLitter,
    updateLitter,
    addPuppy,
    updatePuppy,
    deletePuppy,
    deleteLitter,
    archiveLitter
  };
}
