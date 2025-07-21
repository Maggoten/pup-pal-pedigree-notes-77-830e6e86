
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { BarChart2, Edit, Trash2, Scale, Ruler } from 'lucide-react';
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
        return <Badge variant="warning" className="text-sm px-4 py-1">Reserved</Badge>;
      case 'Sold':
        return <Badge variant="success" className="text-sm px-4 py-1">Sold</Badge>;
      default:
        return <Badge variant="info" className="text-sm px-4 py-1">Available</Badge>;
    }
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
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer bg-white max-w-sm mx-auto ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={() => navigate(`/my-litters/${litterId}/puppy/${puppy.id}`)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Profile Picture - Centered at top */}
          <div className="flex justify-start">
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-warmbeige-200 shadow-sm">
              <AspectRatio ratio={1/1}>
                {puppy.imageUrl ? (
                  <img 
                    src={puppy.imageUrl} 
                    alt={puppy.name} 
                    className="object-cover object-left w-full h-full"
                  />
                ) : (
                  <div className="bg-warmgreen-100 text-warmgreen-800 font-semibold text-6xl w-full h-full flex items-center justify-center">
                    {puppy.name.charAt(0)}
                  </div>
                )}
              </AspectRatio>
            </div>
          </div>

          {/* Puppy Name - Centered below picture */}
          <h3 className="text-3xl font-bold text-warmgreen-800 text-center">
            {puppy.name}
          </h3>

          {/* Gender and Color Info - Centered */}
          <div className="flex items-center justify-center gap-4 text-muted-foreground text-lg">
            <span className="flex items-center gap-1">
              {puppy.gender === 'male' ? '♂' : '♀'} {puppy.gender}
            </span>
            <span>•</span>
            <span>{puppy.color}</span>
          </div>

          {/* Birth Info and Status Badge Row */}
          <div className="flex justify-between items-center">
            <div className="text-lg">
              <span className="text-muted-foreground">Born: </span>
              <span className="font-medium">
                {puppy.birthDateTime ? format(parseISO(puppy.birthDateTime), 'MMM d, yyyy') : 'Not set'}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Weight and Height Measurements */}
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium">Weight</span>
              </div>
              <p className="text-2xl font-semibold">{getLatestWeight()}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-medium">Height</span>
              </div>
              <p className="text-2xl font-semibold">{getLatestHeight()}</p>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleMeasurementClick}
              className="rounded-2xl w-16 h-16 p-0"
            >
              <BarChart2 className="h-6 w-6" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleEditClick}
              className="rounded-2xl w-16 h-16 p-0"
            >
              <Edit className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={handleDeleteClick}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl w-16 h-16 p-0"
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyProfileCard;
