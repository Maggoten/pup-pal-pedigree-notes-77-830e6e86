
import React, { ReactNode, useEffect, lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import WelcomeHeader from '@/components/WelcomeHeader';
import OptimizedSEOHead from '@/components/seo/OptimizedSEOHead';
import { SEOData } from '@/utils/seo';

// Lazy load GlobalStructuredData for better performance
const GlobalStructuredData = lazy(() => import('@/components/seo/GlobalStructuredData'));

interface PageLayoutProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  seoKey?: string;
  seoData?: Partial<SEOData>;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  description, 
  icon, 
  children,
  className = "",
  seoKey,
  seoData
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
    // Use type assertion for vendor-prefixed CSS property
    (document.documentElement.style as any)['-webkit-overflow-scrolling'] = 'touch';
    
    // Prevent any potential scroll locks
    document.body.style.position = 'relative';
    document.body.style.minHeight = '100%';
  }, []);

  // Detect Lovable environment and skip heavy SEO loading
  const isLovablePreview = typeof window !== 'undefined' && 
    (window.location.hostname.includes('lovable.app') || window.parent !== window);
  
  // Skip auth pages and Lovable preview for structured data
  const isAuthPage = ['login', 'register', 'reset-password', 'auth'].includes(seoKey || '');
  const shouldLoadStructuredData = seoKey === 'home' && 
    !isAuthPage && 
    !isLovablePreview && 
    import.meta.env.PROD;

  return (
    <div className={`min-h-screen flex flex-col bg-background overflow-y-auto ${className}`}>
      <OptimizedSEOHead seoKey={seoKey} customSEO={seoData} />
      {shouldLoadStructuredData && (
        <Suspense fallback={null}>
          <GlobalStructuredData />
        </Suspense>
      )}
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
