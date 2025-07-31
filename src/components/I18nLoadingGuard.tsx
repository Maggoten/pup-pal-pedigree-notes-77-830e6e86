import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

interface I18nLoadingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  namespace?: string | string[];
}

const I18nLoadingGuard: React.FC<I18nLoadingGuardProps> = ({ 
  children, 
  fallback,
  namespace = 'common'
}) => {
  const { ready } = useTranslation(namespace);
  
  if (!ready) {
    return fallback || (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return <>{children}</>;
};

export default I18nLoadingGuard;