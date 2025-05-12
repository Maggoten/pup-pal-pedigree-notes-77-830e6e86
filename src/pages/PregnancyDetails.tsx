
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Loader2 } from 'lucide-react';
import { usePregnancyDetails } from '@/hooks/usePregnancyDetails';
import { getActivePregnancies } from '@/services/PregnancyService';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyDropdownSelector from '@/components/pregnancy/PregnancyDropdownSelector';
import AddPregnancyDialog from '@/components/pregnancy/AddPregnancyDialog';
import ManagePregnancyDialog from '@/components/pregnancy/ManagePregnancyDialog';
import { Button } from '@/components/ui/button';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { useIsMobile } from '@/hooks/use-mobile';

const PregnancyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [loadingPregnancies, setLoadingPregnancies] = useState(true);
  const [addPregnancyDialogOpen, setAddPregnancyDialogOpen] = useState(false);
  const [managePregnancyDialogOpen, setManagePregnancyDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // ✅ Skydda innan hook anropas
  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Laddar dräktighetsdata...</p>
        </div>
      </div>
    );
  }

  const { pregnancy, loading } = usePregnancyDetails(id);

  useEffect(() => {
    const fetchPregnancies = async () => {
      try {
        const result = await getActivePregnancies();
        setActivePregnancies(result);
      } catch (error) {
        console.error("Error loading pregnancies:", error);
      } finally {
        setLoadingPregnancies(false);
      }
    };

    fetchPregnancies();
  }, []);

  return (
    <PageLayout>
      <PregnancyDropdownSelector
        pregnancies={activePregnancies}
        loading={loadingPregnancies}
        currentPregnancyId={id}
      />

      <div className="my-4">
        <PregnancySummaryCards pregnancy={pregnancy} loading={loading} />
      </div>

      <PregnancyTabs
        pregnancy={pregnancy}
        loading={loading}
        onEdit={() => setManagePregnancyDialogOpen(true)}
        onAdd={() => setAddPregnancyDialogOpen(true)}
        isMobile={isMobile}
      />

      <AddPregnancyDialog
        open={addPregnancyDialogOpen}
        onOpenChange={setAddPregnancyDialogOpen}
      />

      <ManagePregnancyDialog
        open={managePregnancyDialogOpen}
        onOpenChange={setManagePregnancyDialogOpen}
        pregnancy={pregnancy}
      />
    </PageLayout>
  );
};

export default PregnancyDetails;
