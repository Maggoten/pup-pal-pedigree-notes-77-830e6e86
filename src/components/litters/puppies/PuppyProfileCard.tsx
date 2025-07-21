
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BarChart2, Edit, Trash2, Circle } from 'lucide-react';
import { Puppy } from '@/types/breeding';

interface PuppyProfileCardProps {
  puppy: Puppy;
  onPuppyClick: (puppy: Puppy) => void;
  onAddMeasurement: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  isSelected?: boolean;
  litterAge: number;
}

const PuppyProfileCard: React.FC<PuppyProfileCardProps> = ({
  puppy,
  onPuppyClick,
  onAddMeasurement,
  onUpdatePuppy,
  onDeletePuppy,
  isSelected = false,
  litterAge
}) => {
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
    onPuppyClick(puppy);
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
      onClick={() => onPuppyClick(puppy)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-warmbeige-200 shadow-sm">
              {puppy.imageUrl ? (
                <AvatarImage src={puppy.imageUrl} alt={puppy.name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-warmgreen-100 text-warmgreen-800 font-medium text-lg">
                  {puppy.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <h3 className="text-xl font-semibold text-warmgreen-800 mb-1">{puppy.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Circle className={`h-4 w-4 ${puppy.gender === 'male' ? 'text-blue-500 fill-blue-500' : 'text-pink-500 fill-pink-500'}`} />
                <span className="capitalize">{puppy.gender}</span>
                <span>•</span>
                <span>{puppy.color}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-warmbeige-50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Born</p>
            <p className="font-medium">{getBirthDate()}</p>
          </div>
          
          <div className="bg-warmbeige-50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
            <p className="font-medium">{getLatestWeight()}</p>
          </div>
          
          <div className="bg-warmbeige-50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Current Height</p>
            <p className="font-medium">{getLatestHeight()}</p>
          </div>
          
          <div className="bg-warmbeige-50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Age</p>
            <p className="font-medium">{litterAge} weeks</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMeasurementClick}
              className="flex items-center gap-1"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Measurements</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyProfileCard;
