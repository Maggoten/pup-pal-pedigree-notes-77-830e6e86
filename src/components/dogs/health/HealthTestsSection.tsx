import React, { useState } from 'react';
import { Dog, HealthTest } from '@/types/dogs';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { FlaskConical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { DogHealthService } from '@/services/dogs/dogHealthService';
import AddHealthTestDialog from './AddHealthTestDialog';

interface HealthTestsSectionProps {
  dog: Dog;
  onUpdate?: () => void;
}

const HealthTestsSection: React.FC<HealthTestsSectionProps> = ({ dog, onUpdate }) => {
  const { t } = useTranslation('dogs');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteTest, setDeleteTest] = useState<HealthTest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const healthTests = dog.healthTests || dog.health_tests || [];

  const getTestTypeLabel = (test: HealthTest) => {
    if (test.type === 'other' && test.customType) {
      return test.customType;
    }
    const labels: Record<string, string> = {
      hd: t('health.tests.types.hd', 'HD X-ray'),
      ed: t('health.tests.types.ed', 'ED X-ray'),
      eye: t('health.tests.types.eye', 'Eye Examination'),
      other: t('health.tests.types.other', 'Other')
    };
    return labels[test.type] || test.type;
  };

  const handleDelete = async () => {
    if (!deleteTest?.id) return;
    
    setIsDeleting(true);
    try {
      await DogHealthService.deleteHealthTest(dog.id, deleteTest.id);
      toast({
        title: t('health.tests.deleteSuccess', 'Test deleted'),
        description: t('health.tests.deleteSuccessDesc', 'Health test has been removed')
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('health.tests.deleteError', 'Failed to delete test'),
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setDeleteTest(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          {t('health.tests.title', 'Health Tests')}
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAddDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('health.tests.addTest', 'Add Test')}
        </Button>
      </div>

      {healthTests.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border border-warmbeige-200 rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5">
                  <TableHead>{t('health.tests.type', 'Type')}</TableHead>
                  <TableHead>{t('health.tests.date', 'Date')}</TableHead>
                  <TableHead>{t('health.tests.result', 'Result')}</TableHead>
                  <TableHead>{t('health.tests.vet', 'Vet/Clinic')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthTests.map((test, index) => (
                  <TableRow key={test.id || index}>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {getTestTypeLabel(test)}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(parseISO(test.date), 'yyyy-MM-dd')}</TableCell>
                    <TableCell className="font-medium">{test.result}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {test.vet || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTest(test)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {healthTests.map((test, index) => (
              <div 
                key={test.id || index}
                className="p-4 rounded-lg border border-warmbeige-200 bg-white space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-base text-foreground">
                      {getTestTypeLabel(test)}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(test.date), 'yyyy-MM-dd')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive -mt-1 -mr-2"
                    onClick={() => setDeleteTest(test)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground text-xs">{t('health.tests.result', 'Result')}:</span>
                    <p className="font-medium">{test.result}</p>
                  </div>
                  {test.vet && (
                    <div>
                      <span className="text-muted-foreground text-xs">{t('health.tests.vet', 'Vet/Clinic')}:</span>
                      <p>{test.vet}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 border border-warmbeige-200 rounded-lg bg-primary/5">
          <FlaskConical className="h-8 w-8 mx-auto text-primary/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            {t('health.tests.noTests', 'No health tests recorded')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('health.tests.addFirstTest', 'Add your first health test to track results')}
          </p>
        </div>
      )}

      <AddHealthTestDialog
        dogId={dog.id}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={onUpdate}
      />

      <AlertDialog open={!!deleteTest} onOpenChange={() => setDeleteTest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('health.tests.deleteTitle', 'Delete Health Test')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('health.tests.deleteConfirm', 'Are you sure you want to delete this health test? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('common.loading', 'Loading...') : t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HealthTestsSection;
