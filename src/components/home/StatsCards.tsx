
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Dog, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDogs } from '@/context/DogsContext';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  linkText: string;
  linkPath: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  linkText, 
  linkPath 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="text-lg flex items-center gap-2 font-semibold mb-1">
          {icon}
          <span>{title}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button variant="link" className="px-0 mt-1" onClick={() => navigate(linkPath)}>
          {linkText} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

interface StatsCardsProps {
  activePregnancies: ActivePregnancy[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ activePregnancies }) => {
  const { dogs } = useDogs();
  
  // Calculate statistics
  const totalDogs = dogs.length;
  const femaleDogs = dogs.filter(dog => dog.gender === 'female').length;
  const maleDogs = dogs.filter(dog => dog.gender === 'male').length;
  
  const plannedLittersCount = Math.round(Math.random() * 5); // This will be replaced with actual data in the future
  const littersCount = Math.round(Math.random() * 3); // This will be replaced with actual data in the future
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard 
        title="Dogs" 
        value={totalDogs}
        description={`${maleDogs} males, ${femaleDogs} females`}
        icon={<Dog className="h-5 w-5 text-primary" />}
        linkText="View all dogs"
        linkPath="/my-dogs"
      />
      
      <StatsCard 
        title="Planned Litters" 
        value={plannedLittersCount}
        description="Upcoming breeding plans"
        icon={<Calendar className="h-5 w-5 text-primary" />}
        linkText="Manage plans"
        linkPath="/planned-litters"
      />
      
      <StatsCard 
        title="Active Pregnancies" 
        value={activePregnancies.length}
        description="Pregnancies in progress"
        icon={<PawPrint className="h-5 w-5 text-primary" />}
        linkText="Track pregnancies"
        linkPath="/pregnancy"
      />
      
      <StatsCard 
        title="Litters" 
        value={littersCount}
        description="Current litters"
        icon={<Dog className="h-5 w-5 text-primary" />}
        linkText="Manage litters"
        linkPath="/my-litters"
      />
    </div>
  );
};

export default StatsCards;
