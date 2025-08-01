
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/context/DogsContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { X, Database, User, RefreshCw, ChevronDown, ChevronUp, Bug, Calendar } from 'lucide-react';
import { triggerAllReminders } from '@/services/ReminderService';
import { useQueryClient } from '@tanstack/react-query';

const isMobileDevice = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const isDevMode = () => {
  return process.env.NODE_ENV !== 'production';
};

const checkBrowserCompatibility = () => {
  const issues = [];
  
  if (!('noModule' in document.createElement('script'))) {
    issues.push('ES Modules not fully supported');
  }
  
  if (typeof window.IntersectionObserver === 'undefined') {
    issues.push('IntersectionObserver not supported');
  }
  
  if (typeof window.ResizeObserver === 'undefined') {
    issues.push('ResizeObserver not supported');
  }
  
  return issues;
};

// Safe hook wrapper to handle context not being ready
const useSafeDogs = () => {
  const { isAuthReady, isLoggedIn } = useAuth();
  
  try {
    if (!isAuthReady || !isLoggedIn) {
      return {
        dogs: [],
        loading: false,
        refreshDogs: async () => {}
      };
    }
    return useDogs();
  } catch (error) {
    console.warn('[MobileDebugPanel] Dogs context not ready:', error);
    return {
      dogs: [],
      loading: false,
      refreshDogs: async () => {}
    };
  }
};

const MobileDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user, session, isAuthReady } = useAuth();
  const { dogs, loading: dogsLoading, refreshDogs } = useSafeDogs();
  const { reminders, isLoading: remindersLoading, refreshReminderData } = useBreedingReminders();
  const [deviceInfo, setDeviceInfo] = useState('');
  const [networkType, setNetworkType] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const shouldShowPanel = isDevMode();
    setIsVisible(shouldShowPanel);
    
    if (shouldShowPanel) {
      setDeviceInfo(navigator.userAgent);
      setNetworkType((navigator as any).connection?.effectiveType || 'unknown');
      setCompatibilityIssues(checkBrowserCompatibility());
      
      console.log(`[MobileDebug] Is mobile device: ${isMobileDevice()}`);
      console.log(`[MobileDebug] User agent: ${navigator.userAgent}`);
      console.log(`[MobileDebug] Screen size: ${window.innerWidth}x${window.innerHeight}`);
      
      const connection = (navigator as any).connection;
      if (connection) {
        const updateNetworkInfo = () => {
          setNetworkType(connection.effectiveType || 'unknown');
        };
        connection.addEventListener('change', updateNetworkInfo);
        return () => connection.removeEventListener('change', updateNetworkInfo);
      }
    }
  }, []);
  
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      console.log('[MobileDebug] Refreshing all data');
      
      await queryClient.invalidateQueries();
      
      // Only refresh dogs if context is available
      if (isAuthReady && refreshDogs) {
        await refreshDogs();
        console.log('[MobileDebug] Dogs refreshed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (refreshReminderData) {
        await refreshReminderData();
        console.log('[MobileDebug] Reminders refreshed');
      }
      
      if (user && dogs.length > 0) {
        const manualReminders = await triggerAllReminders(user.id);
        console.log(`[MobileDebug] Manually generated ${manualReminders.length} reminders`);
      }
    } catch (error) {
      console.error('[MobileDebug] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {isOpen ? (
        <Card className="rounded-b-none border-b-0">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Mobile Debug Panel
            </CardTitle>
            <div className="flex items-center gap-2">
              <RefreshCw 
                className={`h-4 w-4 cursor-pointer ${refreshing ? 'animate-spin' : ''}`} 
                onClick={() => window.location.reload()}
              />
              <ChevronDown 
                className="h-4 w-4 cursor-pointer" 
                onClick={() => setIsOpen(false)}
              />
              <X 
                className="h-4 w-4 cursor-pointer" 
                onClick={() => setIsVisible(false)}
              />
            </div>
          </CardHeader>
          <CardContent className="py-2 px-4 text-xs space-y-3">
            <div>
              <div className="font-bold">Auth Status:</div> 
              <div className="ml-2">
                <div>Auth Ready: {isAuthReady ? 'Yes' : 'No'}</div>
                <div>Session valid: {session ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div>
              <div className="font-bold">Network:</div> 
              <div className="ml-2">{networkType}</div>
            </div>
            
            {compatibilityIssues.length > 0 && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                <div className="font-bold text-yellow-800 dark:text-yellow-200">Compatibility Issues:</div>
                <ul className="ml-2 list-disc list-inside">
                  {compatibilityIssues.map((issue, i) => (
                    <li key={i} className="text-yellow-700 dark:text-yellow-300">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <div className="font-bold flex items-center gap-1">
                <User className="h-3 w-3" />
                Authentication:
              </div>
              <div className="ml-2">
                <div>User ID: {user?.id || 'Not logged in'}</div>
                <div>Session valid: {session ? 'Yes' : 'No'}</div>
                <div>Token length: {session?.access_token?.length || 0} characters</div>
              </div>
            </div>
            
            <div>
              <div className="font-bold flex items-center gap-1">
                <Database className="h-3 w-3" />
                Data:
              </div>
              <div className="ml-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span>Dogs:</span> 
                  <Badge variant={dogsLoading ? "outline" : "default"}>
                    {dogsLoading ? 'Loading...' : dogs.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Reminders:</span> 
                  <Badge variant={remindersLoading ? "outline" : "default"}>
                    {remindersLoading ? 'Loading...' : reminders.length}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-xs opacity-70 max-h-20 overflow-auto">
              {deviceInfo}
            </div>
          </CardContent>
          <CardFooter className="py-2 px-4">
            <Button
              size="sm"
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="w-full"
            >
              {refreshing && <RefreshCw className="h-3 w-3 mr-2 animate-spin" />}
              {refreshing ? 'Refreshing...' : 'Force Refresh All Data'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-muted/60 backdrop-blur-sm w-full rounded-t-none rounded-b-none border-t"
          onClick={() => setIsOpen(true)}
        >
          <ChevronUp className="h-3 w-3 mr-2" />
          Debug Panel
        </Button>
      )}
    </div>
  );
};

export default MobileDebugPanel;
