import React, { useReducer, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/context/DogsContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { X, Database, User, RefreshCw, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { triggerAllReminders } from '@/services/ReminderService';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

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

// State management using useReducer to prevent state queue conflicts
interface DebugState {
  isOpen: boolean;
  isVisible: boolean;
  deviceInfo: string;
  networkType: string;
  refreshing: boolean;
  compatibilityIssues: string[];
}

type DebugAction = 
  | { type: 'TOGGLE_OPEN' }
  | { type: 'SET_VISIBLE'; payload: boolean }
  | { type: 'SET_DEVICE_INFO'; payload: string }
  | { type: 'SET_NETWORK_TYPE'; payload: string }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_COMPATIBILITY_ISSUES'; payload: string[] }
  | { type: 'INIT_DEBUG_INFO'; payload: { deviceInfo: string; networkType: string; compatibilityIssues: string[] } };

const debugReducer = (state: DebugState, action: DebugAction): DebugState => {
  switch (action.type) {
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_VISIBLE':
      return { ...state, isVisible: action.payload };
    case 'SET_DEVICE_INFO':
      return { ...state, deviceInfo: action.payload };
    case 'SET_NETWORK_TYPE':
      return { ...state, networkType: action.payload };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'SET_COMPATIBILITY_ISSUES':
      return { ...state, compatibilityIssues: action.payload };
    case 'INIT_DEBUG_INFO':
      return { 
        ...state, 
        deviceInfo: action.payload.deviceInfo,
        networkType: action.payload.networkType,
        compatibilityIssues: action.payload.compatibilityIssues
      };
    default:
      return state;
  }
};

const initialState: DebugState = {
  isOpen: false,
  isVisible: false,
  deviceInfo: '',
  networkType: '',
  refreshing: false,
  compatibilityIssues: []
};

// Safe data hooks that always return values - hooks must be called unconditionally
const useSafeDogsData = () => {
  const { isAuthReady, isLoggedIn } = useAuth();
  
  // Always call the hook - this is safe now that we're inside DogsProvider
  const contextData = useDogs();
  
  // Return safe defaults if not ready
  if (!isAuthReady || !isLoggedIn) {
    return { 
      dogs: [] as any[], 
      loading: false, 
      refreshDogs: async () => { return []; } 
    };
  }
  
  return {
    dogs: contextData.dogs || [],
    loading: contextData.loading || false,
    refreshDogs: async () => { 
      await contextData.refreshDogs?.(); 
      return contextData.dogs || [];
    }
  };
};

const useSafeRemindersData = () => {
  const { isAuthReady, isLoggedIn } = useAuth();
  
  // Always call the hook to follow rules of hooks
  const contextData = useBreedingReminders();
  
  // Return safe defaults if not ready
  if (!isAuthReady || !isLoggedIn) {
    return { 
      reminders: [] as any[], 
      isLoading: false, 
      refreshReminderData: async () => { return Promise.resolve(); } 
    };
  }
  
  return {
    reminders: contextData.reminders || [],
    isLoading: contextData.isLoading || false,
    refreshReminderData: async () => { 
      await contextData.refreshReminderData?.();
      return Promise.resolve();
    }
  };
};

const MobileDebugPanel: React.FC = () => {
  const [state, dispatch] = useReducer(debugReducer, initialState);
  const { user, session, isAuthReady } = useAuth();
  const { dogs, loading: dogsLoading, refreshDogs } = useSafeDogsData();
  const { reminders, isLoading: remindersLoading, refreshReminderData } = useSafeRemindersData();
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Initialize debug info on mount
  useEffect(() => {
    const shouldShowPanel = isDevMode();
    dispatch({ type: 'SET_VISIBLE', payload: shouldShowPanel });
    
    if (shouldShowPanel) {
      const deviceInfo = navigator.userAgent;
      const networkType = (navigator as any).connection?.effectiveType || 'unknown';
      const compatibilityIssues = checkBrowserCompatibility();
      
      dispatch({ 
        type: 'INIT_DEBUG_INFO', 
        payload: { deviceInfo, networkType, compatibilityIssues }
      });
      
      console.log(`[MobileDebug] Is mobile device: ${isMobileDevice()}`);
      console.log(`[MobileDebug] User agent: ${navigator.userAgent}`);
      console.log(`[MobileDebug] Screen size: ${window.innerWidth}x${window.innerHeight}`);
    }
  }, []);
  
  // Handle network type changes
  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection && state.isVisible) {
      const updateNetworkInfo = () => {
        dispatch({ type: 'SET_NETWORK_TYPE', payload: connection.effectiveType || 'unknown' });
      };
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, [state.isVisible]);
  
  const handleRefreshAll = useCallback(async () => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
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
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [isAuthReady, refreshDogs, refreshReminderData, user, dogs.length, queryClient]);
  
  // Don't render if not visible, if auth is not ready, or on public pages where it might interfere
  const isPublicPage = ['/login', '/about', '/reset-password', '/registration-success'].includes(location.pathname);
  if (!state.isVisible || !isAuthReady || isPublicPage) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {state.isOpen ? (
        <Card className="rounded-b-none border-b-0">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Mobile Debug Panel
            </CardTitle>
            <div className="flex items-center gap-2">
              <RefreshCw 
                className={`h-4 w-4 cursor-pointer ${state.refreshing ? 'animate-spin' : ''}`} 
                onClick={() => window.location.reload()}
              />
              <ChevronDown 
                className="h-4 w-4 cursor-pointer" 
                onClick={() => dispatch({ type: 'TOGGLE_OPEN' })}
              />
              <X 
                className="h-4 w-4 cursor-pointer" 
                onClick={() => dispatch({ type: 'SET_VISIBLE', payload: false })}
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
              <div className="ml-2">{state.networkType}</div>
            </div>
            
            {state.compatibilityIssues.length > 0 && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                <div className="font-bold text-yellow-800 dark:text-yellow-200">Compatibility Issues:</div>
                <ul className="ml-2 list-disc list-inside">
                  {state.compatibilityIssues.map((issue, i) => (
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
              {state.deviceInfo}
            </div>
          </CardContent>
          <CardFooter className="py-2 px-4">
            <Button
              size="sm"
              onClick={handleRefreshAll}
              disabled={state.refreshing}
              className="w-full"
            >
              {state.refreshing && <RefreshCw className="h-3 w-3 mr-2 animate-spin" />}
              {state.refreshing ? 'Refreshing...' : 'Force Refresh All Data'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-muted/60 backdrop-blur-sm w-full rounded-t-none rounded-b-none border-t"
          onClick={() => dispatch({ type: 'TOGGLE_OPEN' })}
        >
          <ChevronUp className="h-3 w-3 mr-2" />
          Debug Panel
        </Button>
      )}
    </div>
  );
};

export default MobileDebugPanel;