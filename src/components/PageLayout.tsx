
import React, { ReactNode, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import WelcomeHeader from '@/components/WelcomeHeader';

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  description, 
  icon, 
  children,
  className = ""
}) => {
  // Add useEffect to force scrollability on mount
  useEffect(() => {
    // Reset scroll position to top
    window.scrollTo(0, 0);
    
    // Force scrollability on HTML and body elements
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    
    // Special handling for iOS Safari
    document.documentElement.style.height = 'auto';
    document.documentElement.style.WebkitOverflowScrolling = 'touch';
    
    // Prevent any potential scroll locks
    document.body.style.position = 'relative';
    document.body.style.minHeight = '100%';
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-background overflow-y-auto ${className}`}>
      <Navbar />
      <WelcomeHeader />
      
      <main className="flex-1 container py-4 space-y-4 overflow-y-auto">
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
