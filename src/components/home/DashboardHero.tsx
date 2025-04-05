
import React from 'react';
import StatsCards from './StatsCards';
import { Dog, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardHeroProps {
  username: string;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ username }) => {
  const navigate = useNavigate();
  
  const handleAddDogClick = () => {
    navigate('/my-dogs');
  };
  
  return (
    <div className="rounded-lg overflow-hidden border border-primary/20 bg-gradient-to-br from-[#F5F0E5] to-[#EAE0C9]">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
              <Dog className="h-6 w-6 text-primary" />
              Good day, {username}!
            </h2>
            <p className="text-muted-foreground max-w-md">
              Keep track of your breeding program with our helpful tools.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleAddDogClick}
              variant="default" 
              className="shadow-sm"
            >
              <Dog className="mr-2 h-4 w-4" />
              Add New Dog
            </Button>
            
            <Button
              variant="outline"
              className="bg-white/50 shadow-sm border-primary/20"
              onClick={() => navigate('/planned-litters')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Plan Litter
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          <StatsCards condensed={true} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
