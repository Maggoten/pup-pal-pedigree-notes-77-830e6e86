
import React, { useState, useEffect } from 'react';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import { Skeleton } from '@/components/ui/skeleton';
import MyLittersContent from '@/components/litters/MyLittersContent';
import PageLayout from '@/components/PageLayout';
import { PawPrint, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import useLitterQueries from '@/hooks/litters/queries/useLitterQueries';

const MyLittersLoading = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-12 w-64" />
    <Skeleton className="h-6 w-96" />
    <div className="mt-8 space-y-6">
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

const MyLitters: React.FC = () => {
  const [contentLoading, setContentLoading] = useState(true);
  const { isAuthReady } = useAuth();
  const [showError, setShowError] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // ✅ Skydda från att köra queries för tidigt
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Laddar användarsession...</p>
        </div>
      </div>
    );
  }

  // ✅ Nu är det säkert att köra hooken
  const { isError, error, refreshLitters } = useLitterQueries();

  // Simulera inläsning
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageLayout>
      <LitterFilterProvider>
        {showError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ett fel uppstod vid hämtning av kullar.
              <Button
                onClick={() => {
                  setRetryAttempt((prev) => prev + 1);
                  refreshLitters();
                }}
                variant="link"
                className="ml-2 text-sm p-0 h-auto"
              >
                Försök igen
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isError && !showError && (
          <Alert variant="destructive" className="mb-4">
            <PawPrint className="h-4 w-4" />
            <AlertDescription>
              Kunde inte ladda kullar. Försök igen senare.
            </AlertDescription>
          </Alert>
        )}

        {contentLoading ? <MyLittersLoading /> : <MyLittersContent />}
      </LitterFilterProvider>
    </PageLayout>
  );
};

export default MyLitters;
