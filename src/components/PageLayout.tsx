
import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import WelcomeHeader from '@/components/WelcomeHeader';

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  description, 
  icon, 
  children
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <WelcomeHeader />
      <Navbar />
      
      <main className="flex-1 container py-8 space-y-6">
        <div className="flex flex-col items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && <div className="text-primary">{icon}</div>}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          </div>
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
