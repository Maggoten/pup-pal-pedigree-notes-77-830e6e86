
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Dog, Heart, PawPrint } from 'lucide-react';
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
  color: string;
  condensed?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  linkText, 
  linkPath,
  color,
  condensed = false
}) => {
  const navigate = useNavigate();
  
  if (condensed) {
    return (
      <div className="bg-white/70 rounded-md shadow-sm p-3 border border-primary/10 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
              {icon}
            </div>
            <div>
              <div className="font-medium text-lg">{value}</div>
              <div className="text-xs text-muted-foreground">{title}</div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(linkPath)}
            className="rounded-full hover:bg-primary/10"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="bg-white h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1 border-t-4" style={{ borderTopColor: color }}>
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
  activePregnancies?: ActivePregnancy[];
  condensed?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ activePregnancies = [], condensed = false }) => {
  const { dogs } = useDogs();
  
  // Calculate statistics
  const totalDogs = dogs.length;
  const femaleDogs = dogs.filter(dog => dog.gender === 'female').length;
  const maleDogs = dogs.filter(dog => dog.gender === 'male').length;
  
  const plannedLittersCount = Math.round(Math.random() * 5); // This will be replaced with actual data in the future
  const littersCount = Math.round(Math.random() * 3); // This will be replaced with actual data in the future
  
  const statCards = [
    {
      title: "Dogs",
      value: totalDogs,
      description: `${maleDogs} males, ${femaleDogs} females`,
      icon: <Dog className="h-5 w-5 text-sky-600" />,
      linkText: "View all dogs",
      linkPath: "/my-dogs",
      color: "#0284c7" // sky-600
    },
    {
      title: "Planned Litters",
      value: plannedLittersCount,
      description: "Upcoming breeding plans",
      icon: <Calendar className="h-5 w-5 text-indigo-600" />,
      linkText: "Manage plans",
      linkPath: "/planned-litters",
      color: "#4f46e5" // indigo-600
    },
    {
      title: "Active Pregnancies",
      value: activePregnancies?.length ?? 0,
      description: "Pregnancies in progress",
      icon: <PawPrint className="h-5 w-5 text-rose-600" />,
      linkText: "Track pregnancies",
      linkPath: "/pregnancy",
      color: "#e11d48" // rose-600
    },
    {
      title: "Litters",
      value: littersCount,
      description: "Current litters",
      icon: <Heart className="h-5 w-5 text-amber-600" />,
      linkText: "Manage litters",
      linkPath: "/my-litters",
      color: "#d97706" // amber-600
    }
  ];
  
  if (condensed) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card, index) => (
          <StatsCard 
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            linkText={card.linkText}
            linkPath={card.linkPath}
            color={card.color}
            condensed={true}
          />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <StatsCard 
          key={index}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          linkText={card.linkText}
          linkPath={card.linkPath}
          color={card.color}
        />
      ))}
    </div>
  );
};

export default StatsCards;
