
import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import BreedingJourneyLogo from './illustrations/BreedingJourneyLogo';

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
      <Navbar />
      
      <main className="flex-1 container py-6 space-y-6">
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
      
      <footer className="border-t py-4 mt-8">
        <div className="container flex justify-between items-center">
          <BreedingJourneyLogo withSlogan={true} />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Breeding Journey. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
