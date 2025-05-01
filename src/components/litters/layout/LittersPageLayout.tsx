
import React, { ReactNode } from 'react';
import { PawPrint } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

interface LittersPageLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
}

const LittersPageLayout: React.FC<LittersPageLayoutProps> = ({ 
  children,
  isLoading = false 
}) => {
  return (
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<PawPrint className="h-6 w-6" />}
    >
      {children}
    </PageLayout>
  );
};

export default LittersPageLayout;
