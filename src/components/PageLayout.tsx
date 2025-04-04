
import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  headerImage?: string;
  headerAlt?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  description, 
  icon, 
  children, 
  headerImage,
  headerAlt = "Breeding Journey header image"
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {headerImage && (
        <div className="w-full relative">
          <div className="h-40 md:h-56 lg:h-64 w-full overflow-hidden">
            <img 
              src={headerImage} 
              alt={headerAlt}
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
      
      <main className={`flex-1 container py-6 space-y-6 ${headerImage ? '-mt-16 relative z-10' : ''}`}>
        <div className={`flex flex-col items-start justify-between gap-4 ${headerImage ? 'bg-background/90 backdrop-blur-sm p-6 rounded-lg border shadow-sm' : ''}`}>
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
