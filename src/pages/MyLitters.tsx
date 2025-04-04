
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart, Dog, LineChart, Pencil } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from '@/services/LitterService';
import { plannedLitterService } from '@/services/PlannedLitterService';
import AddLitterDialog from '@/components/litters/AddLitterDialog';
import AddPuppyDialog from '@/components/litters/AddPuppyDialog';
import PuppyDetailsDialog from '@/components/litters/PuppyDetailsDialog';

const MyLitters: React.FC = () => {
  const [littersData, setLittersData] = useState<Litter[]>([]);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  const [showAddPuppyDialog, setShowAddPuppyDialog] = useState(false);
  const [showPuppyDetailsDialog, setShowPuppyDetailsDialog] = useState(false);
  const [plannedLitters, setPlannedLitters] = useState([]);
  
  // Get the selected litter
  const selectedLitter = selectedLitterId 
    ? littersData.find(litter => litter.id === selectedLitterId) 
    : null;
  
  // Load litters and planned litters on component mount
  useEffect(() => {
    const loadedLitters = litterService.loadLitters();
    if (loadedLitters.length > 0) {
      setLittersData(loadedLitters);
      setSelectedLitterId(loadedLitters[0].id);
    }
    
    const loadedPlannedLitters = plannedLitterService.loadPlannedLitters();
    setPlannedLitters(loadedPlannedLitters);
  }, []);
  
  const handleAddLitter = (newLitter: Litter) => {
    const updatedLitters = litterService.addLitter(newLitter);
    setLittersData(updatedLitters);
    setSelectedLitterId(newLitter.id);
    
    toast({
      title: "Litter Added",
      description: `${newLitter.name} has been added successfully.`
    });
  };
  
  const handleAddPuppy = (newPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.addPuppy(selectedLitterId, newPuppy);
    setLittersData(updatedLitters);
    
    toast({
      title: "Puppy Added",
      description: `${newPuppy.name} has been added to the litter.`
    });
  };
  
  const handleUpdatePuppy = (updatedPuppy: Puppy) => {
    if (!selectedLitterId) return;
    
    const updatedLitters = litterService.updatePuppy(selectedLitterId, updatedPuppy);
    setLittersData(updatedLitters);
    setSelectedPuppy(updatedPuppy);
  };
  
  const handlePuppySelect = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setShowPuppyDetailsDialog(true);
  };
  
  // Prepare chart data
  const getChartData = () => {
    if (!selectedPuppy) return [];
    
    const logData = logType === 'weight' ? selectedPuppy.weightLog : selectedPuppy.heightLog;
    
    return logData.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      [logType]: logType === 'weight' ? entry.weight : entry.height
    }));
  };
  
  const renderPuppyGrowthChart = () => {
    if (!selectedPuppy) {
      return (
        <div className="text-center py-12">
          <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a Puppy</h3>
          <p className="text-muted-foreground">Select a puppy to view growth charts</p>
        </div>
      );
    }
    
    const chartData = getChartData();
    
    if (chartData.length === 0) {
      return (
        <div className="text-center py-12">
          <LineChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            No {logType} data available for {selectedPuppy.name}
          </p>
        </div>
      );
    }
    
    return (
      <div className="h-[300px] w-full">
        <ChartContainer
          config={{
            [logType]: {
              label: logType === 'weight' ? 'Weight (kg)' : 'Height (cm)',
              color: logType === 'weight' ? '#10b981' : '#3b82f6',
            }
          }}
        >
          <RechartsLineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey={logType}
              stroke={logType === 'weight' ? 'var(--color-weight, #10b981)' : 'var(--color-height, #3b82f6)'}
              activeDot={{ r: 8 }}
            />
          </RechartsLineChart>
        </ChartContainer>
      </div>
    );
  };
  
  return (
    <PageLayout 
      title="My Litters" 
      description="Track your litters and individual puppies"
      icon={<Dog className="h-6 w-6" />}
    >
      <div className="flex justify-end">
        <Dialog open={showAddLitterDialog} onOpenChange={setShowAddLitterDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 mb-6">
              <PlusCircle className="h-4 w-4" />
              Add New Litter
            </Button>
          </DialogTrigger>
          <AddLitterDialog 
            onClose={() => setShowAddLitterDialog(false)} 
            onSubmit={handleAddLitter}
            plannedLitters={plannedLitters}
          />
        </Dialog>
      </div>
      
      {littersData.length > 0 ? (
        <>
          <Tabs value={selectedLitterId || ''} onValueChange={setSelectedLitterId} className="space-y-4">
            <TabsList className="w-full justify-start overflow-auto">
              {littersData.map(litter => (
                <TabsTrigger key={litter.id} value={litter.id}>{litter.name}</TabsTrigger>
              ))}
            </TabsList>
            
            {littersData.map(litter => (
              <TabsContent key={litter.id} value={litter.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Litter Details</CardTitle>
                    <CardDescription>
                      Born: {new Date(litter.dateOfBirth).toLocaleDateString()} | 
                      Sire: {litter.sireName} | 
                      Dam: {litter.damName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Puppies ({litter.puppies.length})</h3>
                        <Dialog open={showAddPuppyDialog} onOpenChange={setShowAddPuppyDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <PlusCircle className="h-4 w-4" />
                              Add New Puppy
                            </Button>
                          </DialogTrigger>
                          <AddPuppyDialog 
                            onClose={() => setShowAddPuppyDialog(false)} 
                            onSubmit={handleAddPuppy}
                            puppyNumber={litter.puppies.length + 1}
                            litterDob={litter.dateOfBirth}
                          />
                        </Dialog>
                      </div>
                      
                      {litter.puppies.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Gender</TableHead>
                              <TableHead>Color</TableHead>
                              <TableHead>Breed</TableHead>
                              <TableHead>Birth Weight</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {litter.puppies.map(puppy => (
                              <TableRow key={puppy.id}>
                                <TableCell>{puppy.name}</TableCell>
                                <TableCell>{puppy.gender}</TableCell>
                                <TableCell>{puppy.color}</TableCell>
                                <TableCell>{puppy.breed || '-'}</TableCell>
                                <TableCell>{puppy.birthWeight} kg</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handlePuppySelect(puppy)}
                                    className="flex items-center gap-1"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 border rounded-md">
                          <p className="text-muted-foreground mb-4">No puppies added to this litter yet</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddPuppyDialog(true)}
                            className="flex items-center gap-2"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Add First Puppy
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {litter.puppies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Puppy Growth Charts</span>
                        <div className="flex gap-2">
                          <Button 
                            variant={logType === 'weight' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setLogType('weight')}
                          >
                            Weight
                          </Button>
                          <Button 
                            variant={logType === 'height' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setLogType('height')}
                          >
                            Height
                          </Button>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {selectedPuppy 
                          ? `Tracking ${logType} for ${selectedPuppy.name}`
                          : 'Select a puppy to view growth charts'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderPuppyGrowthChart()}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
          
          {/* Puppy Details Dialog */}
          {selectedPuppy && (
            <Dialog open={showPuppyDetailsDialog} onOpenChange={setShowPuppyDetailsDialog}>
              <PuppyDetailsDialog 
                puppy={selectedPuppy} 
                onClose={() => setShowPuppyDetailsDialog(false)} 
                onUpdate={handleUpdatePuppy}
              />
            </Dialog>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No Litters Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first litter to start tracking puppies</p>
            <Button onClick={() => setShowAddLitterDialog(true)}>Add Your First Litter</Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default MyLitters;
