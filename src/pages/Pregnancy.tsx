
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getAllPregnancies } from '@/services/PregnancyService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import AddPregnancyDialog from '@/components/pregnancy/AddPregnancyDialog';

const Pregnancy: React.FC = () => {
  const { t, ready } = useTranslation('pregnancy');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasPregnancies, setHasPregnancies] = useState(false);
  const [addPregnancyDialogOpen, setAddPregnancyDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setHasError(false);
        
        const { active, completed } = await getAllPregnancies();
        const allPregnancies = [...active, ...completed];
        
        if (allPregnancies.length > 0) {
          setHasPregnancies(true);
          // Redirect to first pregnancy's detail page
          navigate(`/pregnancy/${allPregnancies[0].id}`, { replace: true });
        } else {
          setHasPregnancies(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching pregnancies:", error);
        setHasError(true);
        toast({
          title: t('toasts.error.failedToLoad'),
          description: t('toasts.error.failedToLoad'),
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchAndRedirect();
  }, [user, navigate, t]);

  const handleAddPregnancyClick = () => {
    setAddPregnancyDialogOpen(true);
  };

  const handleAddPregnancyDialogClose = () => {
    setAddPregnancyDialogOpen(false);
    // Refresh by reloading
    window.location.reload();
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
      ) : !hasPregnancies ? (
        <div className="text-center py-12 bg-greige-50 border border-greige-200 rounded-lg">
          <Heart className="h-16 w-16 text-greige-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-greige-700 mb-2">
            {t('pages.pregnancy.empty.title')}
          </h3>
          <p className="text-greige-500 mb-6">
            {t('pages.pregnancy.empty.description')}
          </p>
          <Button onClick={handleAddPregnancyClick}>
            {t('actions.addPregnancy')}
          </Button>
        </div>
      ) : null}
      
      <AddPregnancyDialog 
        open={addPregnancyDialogOpen} 
        onOpenChange={setAddPregnancyDialogOpen}
        onClose={handleAddPregnancyDialogClose}
      />
    </PageLayout>
  );
};

export default Pregnancy;
