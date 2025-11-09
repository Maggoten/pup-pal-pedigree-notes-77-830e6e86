
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PageLayout from '@/components/PageLayout';
import { Loader2, Heart, Plus, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePregnancyDetails } from '@/hooks/usePregnancyDetails';
import { getAllPregnancies } from '@/services/PregnancyService';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyDropdownSelector from '@/components/pregnancy/PregnancyDropdownSelector';
import AddPregnancyDialog from '@/components/pregnancy/AddPregnancyDialog';
import ManagePregnancyDialog from '@/components/pregnancy/ManagePregnancyDialog';
import AllCompletedPregnanciesDialog from '@/components/pregnancy/AllCompletedPregnanciesDialog';
import { Button } from '@/components/ui/button';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { useIsMobile } from '@/hooks/use-mobile';
import ArchivedPregnancySummary from '@/components/pregnancy/archived/ArchivedPregnancySummary';

const PregnancyDetails = () => {
  const { t, ready } = useTranslation('pregnancy');
  const { id } = useParams<{ id: string }>();
  const { pregnancy, loading, refetch } = usePregnancyDetails(id);
  const { scrollToTop } = useScrollToTop();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [completedPregnancies, setCompletedPregnancies] = useState<ActivePregnancy[]>([]);
  const [loadingPregnancies, setLoadingPregnancies] = useState(true);
  const [addPregnancyDialogOpen, setAddPregnancyDialogOpen] = useState(false);
  const [managePregnancyDialogOpen, setManagePregnancyDialogOpen] = useState(false);
  const [allCompletedDialogOpen, setAllCompletedDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchPregnancies = async () => {
      try {
        setLoadingPregnancies(true);
        const { active, completed } = await getAllPregnancies();
        console.log("Fetched pregnancies for dropdown - Active:", active.length, "Completed:", completed.length);
        setActivePregnancies(active);
        setCompletedPregnancies(completed);
      } catch (error) {
        console.error("Error fetching pregnancies:", error);
      } finally {
        setLoadingPregnancies(false);
      }
    };
    
    fetchPregnancies();
  }, []);

  // Scroll to top when pregnancy data is loaded or id changes
  useEffect(() => {
    if (!loading && !loadingPregnancies && ready && pregnancy) {
      setTimeout(() => {
        scrollToTop();
      }, 50);
    }
  }, [id, loading, loadingPregnancies, ready, pregnancy, scrollToTop]);

  const handleAddPregnancyClick = () => {
    setAddPregnancyDialogOpen(true);
  };

  const handleManagePregnancyClick = () => {
    setManagePregnancyDialogOpen(true);
  };

  const handleAddPregnancyDialogClose = () => {
    setAddPregnancyDialogOpen(false);
    // Refresh pregnancies list after adding a new pregnancy
    const fetchPregnancies = async () => {
      try {
        const { active, completed } = await getAllPregnancies();
        setActivePregnancies(active);
        setCompletedPregnancies(completed);
      } catch (error) {
        console.error("Error refreshing pregnancies:", error);
      }
    };
    fetchPregnancies();
  };

  const handleManagePregnancyDialogClose = async () => {
    setManagePregnancyDialogOpen(false);
    
    // Refetch pregnancy details to get updated status after reactivation/completion
    await refetch();
    
    // Also refresh the pregnancies dropdown list
    try {
      const { active, completed } = await getAllPregnancies();
      setActivePregnancies(active);
      setCompletedPregnancies(completed);
    } catch (error) {
      console.error("Error refreshing pregnancies:", error);
    }
  };

  const handleShowAllCompleted = () => {
    setAllCompletedDialogOpen(true);
  };

  if (!ready || loading || loadingPregnancies) {
    return (
      <PageLayout 
        title={t('pages.details.title')} 
        description={t('pages.details.loadingDescription')}
        icon={<Heart className="h-6 w-6" />}
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">{t('loading.pregnancyDetails')}</span>
        </div>
      </PageLayout>
    );
  }

  if (!pregnancy) {
    return (
      <PageLayout 
        title={t('pages.details.notFound.title')} 
        description={t('pages.details.notFound.description')}
        icon={<Heart className="h-6 w-6" />}
      >
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-greige-700">{t('pages.details.notFound.title')}</h3>
          <p className="text-greige-500 mt-2">{t('pages.details.notFound.message')}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={ready ? t('journey.title', { femaleName: pregnancy.femaleName }) : 'Loading...'} 
      description={ready ? t('pages.details.description') : 'Loading...'}
      icon={<Heart className="h-6 w-6" />}
    >
      {/* Updated vertically stacked action section */}
      <div className="flex flex-col gap-4 mb-6 max-w-xs">
        {/* 1. Add Pregnancy button (primary action) */}
        <Button 
          onClick={handleAddPregnancyClick} 
          variant="default"
          className="flex items-center gap-2 w-full justify-center py-3"
        >
          <Plus className="h-4 w-4" />
          {t('actions.addPregnancy')}
        </Button>
        
        {/* 2. Manage Pregnancy button (secondary action) */}
        <Button 
          onClick={handleManagePregnancyClick} 
          variant="outline"
          className="flex items-center gap-2 w-full justify-center py-3"
        >
          <Settings className="h-4 w-4" />
          {t('actions.managePregnancy')}
        </Button>
        
        {/* 3. Pregnancy selection dropdown */}
        <div className="w-full">
          <PregnancyDropdownSelector 
            activePregnancies={activePregnancies}
            completedPregnancies={completedPregnancies}
            currentPregnancyId={pregnancy.id}
            fullWidth={true}
            onShowAllCompleted={handleShowAllCompleted}
          />
        </div>
      </div>

      <div className="space-y-8">
        {/* Check if pregnancy is completed - show archived view */}
        {pregnancy.status === 'completed' ? (
          <ArchivedPregnancySummary pregnancyId={pregnancy.id} />
        ) : (
          <>
            {/* Hero Section with Pregnancy Summary Cards */}
            <PregnancySummaryCards
              matingDate={pregnancy.matingDate}
              expectedDueDate={pregnancy.expectedDueDate}
              daysLeft={pregnancy.daysLeft}
            />
            
            {/* Full Width Pregnancy Journey Tabs */}
            <div className="w-full">
              <PregnancyTabs 
                pregnancyId={pregnancy.id}
                femaleName={pregnancy.femaleName}
                matingDate={pregnancy.matingDate}
                expectedDueDate={pregnancy.expectedDueDate}
              />
            </div>
          </>
        )}
      </div>

      <AddPregnancyDialog 
        open={addPregnancyDialogOpen} 
        onOpenChange={setAddPregnancyDialogOpen}
        onClose={handleAddPregnancyDialogClose}
      />

      {pregnancy && (
        <ManagePregnancyDialog
          pregnancyId={pregnancy.id}
          femaleName={pregnancy.femaleName}
          pregnancyStatus={pregnancy.status as 'active' | 'completed'}
          open={managePregnancyDialogOpen}
          onOpenChange={setManagePregnancyDialogOpen}
          onClose={handleManagePregnancyDialogClose}
        />
      )}

      <AllCompletedPregnanciesDialog
        open={allCompletedDialogOpen}
        onOpenChange={setAllCompletedDialogOpen}
      />
    </PageLayout>
  );
};

export default PregnancyDetails;
