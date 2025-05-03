
import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import WelcomeHeader from '@/components/WelcomeHeader';

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string; // Added className prop
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  description, 
  icon, 
  children,
  className = "" // Default to empty string
}) => {
  return (
    <div className={`min-h-screen flex flex-col bg-background ${className}`}>
      <Navbar />
      <WelcomeHeader />
      
      <main className="flex-1 container py-4 space-y-4">
        {(title || description) && (
          <div className="flex flex-col items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {icon && <div className="text-primary">{icon}</div>}
              <div>
                {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>
            </div>
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
