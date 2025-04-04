
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface PregnancyHeaderProps {
  femaleName: string;
  maleName: string;
  matingDate: Date;
}

const PregnancyHeader: React.FC<PregnancyHeaderProps> = ({
  femaleName,
  maleName,
  matingDate,
}) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/pregnancy');
  };

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Pregnancies
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-primary">
          <PawPrint className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{femaleName}'s Pregnancy</h1>
          <p className="text-muted-foreground">Mated with {maleName} on {format(matingDate, 'PPP')}</p>
        </div>
      </div>
    </>
  );
};

export default PregnancyHeader;
