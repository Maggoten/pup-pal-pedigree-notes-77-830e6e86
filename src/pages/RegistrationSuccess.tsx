import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import BreedingJourneyLogo from '@/components/BreedingJourneyLogo';

const RegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription, isLoggedIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handleRegistrationSuccess = async () => {
      if (!sessionId) {
        setStatus('error');
        setErrorMessage('No session ID provided');
        return;
      }

      if (!isLoggedIn) {
        setStatus('error');
        setErrorMessage('You must be logged in to complete registration');
        return;
      }

      try {
        console.log('[RegistrationSuccess] Processing successful checkout session:', sessionId);
        
        // Get current session for API calls
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session found');
        }

        // Finalize the subscription setup
        const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalize-registration-subscription', {
          body: { session_id: sessionId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (finalizeError) {
          console.error('[RegistrationSuccess] Finalize subscription failed:', finalizeError);
          throw new Error('Failed to finalize subscription setup');
        }

        console.log('[RegistrationSuccess] Subscription finalized successfully:', finalizeData);
        
        // Force refresh subscription status after successful setup
        await checkSubscription();
        
        setStatus('success');
        
        // Redirect to home after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
      } catch (error) {
        console.error('[RegistrationSuccess] Error processing success:', error);
        setStatus('error');
        setErrorMessage('Failed to complete registration. Please try again.');
      }
    };

    handleRegistrationSuccess();
  }, [sessionId, isLoggedIn, checkSubscription, navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate('/login');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warmbeige-50/70 p-4">
        <Card className="w-full max-w-md shadow-lg bg-white border-warmbeige-200">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <BreedingJourneyLogo size="lg" showText={false} />
            </div>
            <CardTitle className="text-2xl font-bold text-warmgreen-600 font-playfair">
              Completing Registration
            </CardTitle>
            <CardDescription className="text-warmgreen-800">
              Setting up your account and trial...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-warmgreen-600" />
            <p className="text-brown-600">Please wait while we process your registration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warmbeige-50/70 p-4">
        <Card className="w-full max-w-md shadow-lg bg-white border-warmbeige-200">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <BreedingJourneyLogo size="lg" showText={false} />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600 font-playfair">
              Registration Error
            </CardTitle>
            <CardDescription className="text-brown-800">
              Something went wrong
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <p className="text-brown-600 text-center">{errorMessage}</p>
            <div className="flex gap-2 w-full">
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="flex-1 border-warmbeige-300 text-brown-800 hover:bg-warmbeige-100"
              >
                Try Again
              </Button>
              <Button 
                onClick={handleGoHome}
                className="flex-1 bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warmbeige-50/70 p-4">
      <Card className="w-full max-w-md shadow-lg bg-white border-warmbeige-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <BreedingJourneyLogo size="lg" showText={false} />
          </div>
          <CardTitle className="text-2xl font-bold text-warmgreen-600 font-playfair">
            Welcome to Breeding Journey!
          </CardTitle>
          <CardDescription className="text-warmgreen-800">
            Your registration is complete
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-12 w-12 text-warmgreen-600" />
          <div className="text-center space-y-2">
            <p className="text-brown-800 font-medium">Registration successful!</p>
            <p className="text-brown-600 text-sm">
              Your 30-day free trial has started. You'll be redirected to your dashboard shortly.
            </p>
          </div>
          <Button 
            onClick={handleGoHome}
            className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess;