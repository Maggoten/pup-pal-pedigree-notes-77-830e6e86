
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '@/context/DogsContext';
import { getActivePregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

// Import the refactored components
import ActivePregnanciesList from '@/components/pregnancy/ActivePregnanciesList';
import TemperatureLogOverview from '@/components/pregnancy/TemperatureLogOverview';
import WeeklyDevelopmentGuide from '@/components/pregnancy/WeeklyDevelopmentGuide';

const Pregnancy: React.FC = () => {
  const navigate = useNavigate();
  const { dogs } = useDogs();
  const [activePregnancies, setActivePregnancies] = useState<ActivePregnancy[]>([]);

  useEffect(() => {
    const pregnancies = getActivePregnancies();
    setActivePregnancies(pregnancies);
  }, [dogs]);

  const handleAddPregnancyClick = () => {
    navigate('/planned-litters');
  };

  const handleLogTemperature = () => {
    if (activePregnancies.length > 0) {
      navigate(`/pregnancy/${activePregnancies[0].id}`);
    } else {
      toast({
        title: "No active pregnancies",
        description: "Add a pregnancy before recording temperature."
      });
    }
  };

  return (
    <PageLayout 
      title="Pregnancy" 
      description="Track your pregnant bitches and fetal development"
      icon={<Heart className="h-6 w-6" />}
    >
      <div className="flex justify-end">
        <Button onClick={handleAddPregnancyClick} className="mb-6">Add Pregnancy</Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ActivePregnanciesList 
          pregnancies={activePregnancies} 
          onAddPregnancy={handleAddPregnancyClick} 
        />
        <TemperatureLogOverview onLogTemperature={handleLogTemperature} />
      </div>

      <div className="mt-6 beige-gradient rounded-lg border border-greige-300 p-4">
        <WeeklyDevelopmentGuide />
      </div>
    </PageLayout>
  );
};

export default Pregnancy;
