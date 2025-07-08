import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Baby, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getAllCompletedPregnancies } from '@/services/PregnancyService';
import { ActivePregnancy } from './ActivePregnanciesList';

interface AllCompletedPregnanciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AllCompletedPregnanciesDialog: React.FC<AllCompletedPregnanciesDialogProps> = ({
  open,
  onOpenChange
}) => {
  const navigate = useNavigate();
  const [pregnancies, setPregnancies] = useState<ActivePregnancy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAllCompletedPregnancies();
    }
  }, [open]);

  const fetchAllCompletedPregnancies = async () => {
    setLoading(true);
    try {
      const allCompleted = await getAllCompletedPregnancies();
      setPregnancies(allCompleted);
    } catch (error) {
      console.error('Error fetching all completed pregnancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePregnancySelect = (pregnancyId: string) => {
    navigate(`/pregnancy/${pregnancyId}`);
    onOpenChange(false);
  };

  const formatPregnancyDisplayName = (pregnancy: ActivePregnancy) => {
    const monthYear = format(pregnancy.expectedDueDate, 'MMM yyyy');
    return `${pregnancy.femaleName}'s Pregnancy (${monthYear})`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5 text-muted-foreground" />
            All Completed Pregnancies
          </DialogTitle>
          <DialogDescription>
            View and select from all your completed pregnancies
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading pregnancies...</span>
            </div>
          ) : pregnancies.length === 0 ? (
            <div className="text-center py-8">
              <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No completed pregnancies found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pregnancies.map((pregnancy) => (
                <div
                  key={pregnancy.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handlePregnancySelect(pregnancy.id)}
                >
                  <div className="flex items-center gap-3">
                    <Baby className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">
                        {formatPregnancyDisplayName(pregnancy)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Mating: {format(pregnancy.matingDate, 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {format(pregnancy.expectedDueDate, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    Completed
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllCompletedPregnanciesDialog;