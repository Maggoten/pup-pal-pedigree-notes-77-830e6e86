
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { BarChart2, Edit, Trash2, Circle, Scale, Ruler, Image } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import { useIsMobile } from '@/hooks/use-mobile';

interface PuppyProfileCardProps {
  puppy: Puppy;
  onPuppyClick: (puppy: Puppy) => void;
  onAddMeasurement: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  isSelected?: boolean;
  litterAge: number;
  litterId: string;
}

const PuppyProfileCard: React.FC<PuppyProfileCardProps> = ({
  puppy,
  onPuppyClick,
  onAddMeasurement,
  onUpdatePuppy,
  onDeletePuppy,
  isSelected = false,
  litterAge,
  litterId
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get latest weight measurement
  const getLatestWeight = () => {
    if (puppy.weightLog && puppy.weightLog.length > 0) {
      const sortedWeights = [...puppy.weightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedWeights[0].weight} kg`;
    }
    return puppy.currentWeight ? `${puppy.currentWeight} kg` : 'Not recorded';
  };

  // Get latest height measurement
  const getLatestHeight = () => {
    if (puppy.heightLog && puppy.heightLog.length > 0) {
      const sortedHeights = [...puppy.heightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedHeights[0].height} cm`;
    }
    return 'Not recorded';
  };

  // Get status badge
  const getStatusBadge = () => {
    const status = puppy.status || 'Available';
    switch (status) {
      case 'Reserved':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Reserved</Badge>;
      case 'Sold':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Sold</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Available</Badge>;
    }
  };

  // Get birth date display
  const getBirthDate = () => {
    if (puppy.birthDateTime) {
      return format(parseISO(puppy.birthDateTime), 'MMM d, yyyy');
    }
    return 'Birth date not set';
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${puppy.name}"?`)) {
      onDeletePuppy(puppy.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/my-litters/${litterId}/puppy/${puppy.id}`);
  };

  const handleMeasurementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddMeasurement(puppy);
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={() => navigate(`/my-litters/${litterId}/puppy/${puppy.id}`)}
    >
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Header - responsive layout */}
        <div className={`flex items-start justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`${isMobile ? 'h-16 w-16' : 'h-20 w-20'} border-2 border-warmbeige-200 shadow-sm flex-shrink-0 rounded-lg overflow-hidden relative`}>
              <AspectRatio ratio={1/1}>
                {puppy.imageUrl ? (
                  <img 
                    src={puppy.imageUrl} 
                    alt={puppy.name} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-warmgreen-100 text-warmgreen-800 font-medium text-lg w-full h-full flex items-center justify-center">
                    {puppy.name.charAt(0)}
                  </div>
                )}
              </AspectRatio>
              
              {/* Gender badge overlay */}
              <div className="absolute top-1 right-1">
                <Badge className={`text-xs px-1.5 py-0.5 ${puppy.gender === 'male' ? 'bg-blue-500 text-white' : 'bg-rose-400 text-white'}`}>
                  {puppy.gender === 'male' ? 'M' : 'F'}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-warmgreen-800 truncate ${isMobile ? 'text-lg mb-1' : 'text-xl mb-1'}`}>
                {puppy.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">{puppy.color}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-2">
            {getStatusBadge()}
          </div>
        </div>
         
        {/* Birth Info - above measurements for mobile */}
        {isMobile && (
          <div className="flex justify-between items-center mb-3 px-1 text-xs text-muted-foreground">
            <span>Born: {getBirthDate()}</span>
            <span>Age: {litterAge} weeks</span>
          </div>
        )}
        
        {/* Measurements - responsive grid */}
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2 mb-3' : 'grid-cols-2 gap-4 mb-4'}`}>
          <div className="bg-warmbeige-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Weight</p>
            </div>
            <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{getLatestWeight()}</p>
          </div>
          
          
          <div className="bg-warmbeige-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Ruler className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Height</p>
            </div>
            <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{getLatestHeight()}</p>
          </div>
          
          {!isMobile && (
            <>
              <div className="bg-warmbeige-50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Born</p>
                <p className="font-medium">{getBirthDate()}</p>
              </div>
              
              <div className="bg-warmbeige-50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="font-medium">{litterAge} weeks</p>
              </div>
            </>
          )}
        </div>
        
        {/* Actions - responsive layout */}
        <div className={`flex justify-between items-center ${isMobile ? 'gap-2' : ''}`}>
          <div className={`flex ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={handleMeasurementClick}
              className={`flex items-center ${isMobile ? 'px-2 min-w-[44px] h-10' : 'gap-1'}`}
              title="Add measurements"
            >
              <BarChart2 className="h-4 w-4" />
              {!isMobile && <span>Measurements</span>}
            </Button>
            
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={handleEditClick}
              className={`flex items-center ${isMobile ? 'px-2 min-w-[44px] h-10' : 'gap-1'}`}
              title="Edit puppy"
            >
              <Edit className="h-4 w-4" />
              {!isMobile && <span>Edit</span>}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            onClick={handleDeleteClick}
            className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${isMobile ? 'px-2 min-w-[44px] h-10' : ''}`}
            title="Delete puppy"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyProfileCard;
