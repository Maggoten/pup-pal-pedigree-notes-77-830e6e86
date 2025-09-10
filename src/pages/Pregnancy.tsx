
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle, Loader2, PawPrint } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useDogs } from '@/context/DogsContext';
import { getActivePregnancies, getCompletedPregnancies, getFirstActivePregnancy } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/providers/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

import ActivePregnanciesList from '@/components/pregnancy/ActivePregnanciesList';
import CompletedPregnanciesList from '@/components/pregnancy/CompletedPregnanciesList';
import PregnancyDropdownSelector from '@/components/pregnancy/PregnancyDropdownSelector';
import PregnancySummaryCards from '@/components/pregnancy/PregnancySummaryCards';
import PregnancyTabs from '@/components/pregnancy/PregnancyTabs';
import AddPregnancyDialog from '@/components/pregnancy/AddPregnancyDialog';
import { PregnancyDetails } from '@/services/PregnancyService';

const Pregnancy: React.FC = () => {
  const { t, ready } = useTranslation('pregnancy');
  const navigate = useNavigate();
  const { pregnancyId } = useParams();
  const { dogs } = useDogs();
  const { user } = useAuth();
  const { scrollToTop } = useScrollToTop();
  
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);
  const [completedPregnancies, setCompletedPregnancies] = useState<ActivePregnancy[]>([]);
  const [selectedPregnancy, setSelectedPregnancy] = useState<PregnancyDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [addPregnancyDialogOpen, setAddPregnancyDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    // Skip refetching if we've already loaded data
    if (dataFetched) return;
    
    const fetchPregnancies = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setHasError(false);
        
        console.log("Fetching active pregnancies...");
        const [activeData, completedData] = await Promise.all([
          getActivePregnancies(),
          getCompletedPregnancies()
        ]);
        console.log("Fetched active pregnancies count:", activeData.length);
        console.log("Fetched completed pregnancies count:", completedData.length);
        setActivePregnancies(activeData);
        setCompletedPregnancies(completedData);
        
        // If no pregnancies found
        if (activeData.length === 0) {
          console.log("No active pregnancies found");
          setIsLoading(false);
          setDataFetched(true);
          return;
        }
        
        let targetPregnancyId = pregnancyId;
        
        // If no pregnancy ID in URL, redirect to the first pregnancy detail page
        if (!targetPregnancyId && activeData.length > 0) {
          console.log("No ID in URL, redirecting to first pregnancy");
          navigate(`/pregnancy/${activeData[0].id}`, { replace: true });
          return;
        }
        
        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching pregnancies:", error);
        setHasError(true);
        toast({
          title: t('toasts.error.failedToLoad'),
          description: t('toasts.error.failedToLoad')
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPregnancies();
  }, [dogs, user, pregnancyId, navigate, dataFetched]);

  // Scroll to top when data loading is complete or when pregnancyId changes
  useEffect(() => {
    if (!isLoading && dataFetched && ready) {
      setTimeout(() => {
        scrollToTop();
      }, 50);
    }
  }, [pregnancyId, isLoading, dataFetched, ready, scrollToTop]);

  // Scroll to top when switching tabs
  useEffect(() => {
    if (!isLoading && dataFetched) {
      setTimeout(() => {
        scrollToTop();
      }, 50);
    }
  }, [activeTab, isLoading, dataFetched, scrollToTop]);

  const handleAddPregnancyClick = () => {
    setAddPregnancyDialogOpen(true);
  };

  const handleAddPregnancyDialogClose = () => {
    setAddPregnancyDialogOpen(false);
    // Refresh data after adding a pregnancy
    setDataFetched(false);
  };

  const handleRefreshData = () => {
    setDataFetched(false);
  };

  if (!ready) {
    return (
      <PageLayout 
        title="Loading..." 
        description="Loading translations..."
        icon={<Heart className="h-6 w-6" />}
        className="overflow-y-auto"
      >
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={t('pages.pregnancy.title')} 
      description={t('pages.pregnancy.description')}
      icon={<Heart className="h-6 w-6" />}
      className="overflow-y-auto"
    >
      {hasError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('toasts.error.failedToLoad')}</AlertTitle>
          <AlertDescription>
            {t('toasts.error.failedToLoad')}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">{t('loading.pregnancies')}</span>
        </div>
      ) : (
        <div className="bg-greige-50 border border-greige-200 rounded-lg shadow-sm overflow-y-visible">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="p-6 border-b border-greige-200">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  {t('tabs.active')} ({activePregnancies.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <PawPrint className="h-4 w-4" />
                  {t('tabs.completed')} ({completedPregnancies.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="active" className="p-6 pt-4">
              <ActivePregnanciesList 
                pregnancies={activePregnancies} 
                onAddPregnancy={handleAddPregnancyClick}
                isLoading={false}
              />
            </TabsContent>
            
            <TabsContent value="completed" className="p-6 pt-4">
              <CompletedPregnanciesList 
                pregnancies={completedPregnancies}
                isLoading={false}
                onRefresh={handleRefreshData}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      <AddPregnancyDialog 
        open={addPregnancyDialogOpen} 
        onOpenChange={setAddPregnancyDialogOpen}
        onClose={handleAddPregnancyDialogClose}
      />
    </PageLayout>
  );
};

export default Pregnancy;
