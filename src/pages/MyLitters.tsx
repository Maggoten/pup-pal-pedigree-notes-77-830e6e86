
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart, Dog, LineChart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Puppy {
  id: string;
  name: string;
  gender: 'male' | 'female';
  color: string;
  weightLog: { date: string; weight: number }[];
  heightLog: { date: string; height: number }[];
}

interface Litter {
  id: string;
  name: string;
  dateOfBirth: string;
  sireId: string;
  damId: string;
  sireName: string;
  damName: string;
  puppies: Puppy[];
}

// Sample data
const litters: Litter[] = [
  {
    id: '1',
    name: 'Spring Litter 2025',
    dateOfBirth: '2025-04-15',
    sireId: '1',
    damId: '2',
    sireName: 'Max',
    damName: 'Bella',
    puppies: [
      {
        id: '1',
        name: 'Puppy 1',
        gender: 'male',
        color: 'Golden',
        weightLog: [
          { date: '2025-04-15', weight: 0.45 },
          { date: '2025-04-16', weight: 0.48 },
          { date: '2025-04-17', weight: 0.52 },
        ],
        heightLog: [
          { date: '2025-04-15', height: 8.5 },
          { date: '2025-04-16', height: 8.7 },
          { date: '2025-04-17', height: 9.0 },
        ]
      },
      {
        id: '2',
        name: 'Puppy 2',
        gender: 'female',
        color: 'Light Golden',
        weightLog: [
          { date: '2025-04-15', weight: 0.42 },
          { date: '2025-04-16', weight: 0.46 },
          { date: '2025-04-17', weight: 0.49 },
        ],
        heightLog: [
          { date: '2025-04-15', height: 8.2 },
          { date: '2025-04-16', height: 8.5 },
          { date: '2025-04-17', height: 8.7 },
        ]
      }
    ]
  }
];

const MyLitters: React.FC = () => {
  const [littersData, setLittersData] = useState<Litter[]>(litters);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(littersData.length > 0 ? littersData[0].id : null);
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');
  const [newEntry, setNewEntry] = useState<{ value: string }>({ value: '' });
  const [showDialog, setShowDialog] = useState(false);
  
  const selectedLitter = littersData.find(litter => litter.id === selectedLitterId);
  
  const handleAddLitterClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding new litters will be available in the next update."
    });
  };
  
  const handleLogEntry = () => {
    if (!selectedPuppy || !newEntry.value || isNaN(parseFloat(newEntry.value))) {
      toast({
        title: "Invalid Entry",
        description: "Please enter a valid number.",
        variant: "destructive"
      });
      return;
    }
    
    const value = parseFloat(newEntry.value);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Add entry to the selected puppy
    const updatedLitters = littersData.map(litter => {
      if (litter.id === selectedLitterId) {
        const updatedPuppies = litter.puppies.map(puppy => {
          if (puppy.id === selectedPuppy.id) {
            if (logType === 'weight') {
              return {
                ...puppy,
                weightLog: [...puppy.weightLog, { date: today, weight: value }]
              };
            } else {
              return {
                ...puppy,
                heightLog: [...puppy.heightLog, { date: today, height: value }]
              };
            }
          }
          return puppy;
        });
        
        return { ...litter, puppies: updatedPuppies };
      }
      return litter;
    });
    
    setLittersData(updatedLitters);
    setNewEntry({ value: '' });
    setShowDialog(false);
    
    // Also update selected puppy
    if (logType === 'weight') {
      setSelectedPuppy({
        ...selectedPuppy,
        weightLog: [...selectedPuppy.weightLog, { date: today, weight: value }]
      });
    } else {
      setSelectedPuppy({
        ...selectedPuppy,
        heightLog: [...selectedPuppy.heightLog, { date: today, height: value }]
      });
    }
    
    toast({
      title: `${logType === 'weight' ? 'Weight' : 'Height'} Logged`,
      description: `Added ${value} ${logType === 'weight' ? 'kg' : 'cm'} for ${selectedPuppy.name}.`
    });
  };
  
  const handlePuppySelect = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
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
          <Button 
            onClick={() => { setLogType(logType); setShowDialog(true); }} 
            className="mt-4"
          >
            Add {logType === 'weight' ? 'Weight' : 'Height'} Entry
          </Button>
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
            <ChartTooltip content={<ChartTooltipContent />} />
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
        <Button onClick={handleAddLitterClick} className="flex items-center gap-2 mb-6">
          <PlusCircle className="h-4 w-4" />
          Add New Litter
        </Button>
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
                        <Dialog open={showDialog} onOpenChange={setShowDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <BarChart className="h-4 w-4" />
                              Log {logType === 'weight' ? 'Weight' : 'Height'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Log {logType === 'weight' ? 'Weight' : 'Height'}</DialogTitle>
                              <DialogDescription>
                                Enter the {logType === 'weight' ? 'weight in kg' : 'height in cm'} for the selected puppy.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="puppy">Puppy</Label>
                                <select 
                                  id="puppy"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={selectedPuppy?.id || ''}
                                  onChange={(e) => {
                                    const puppy = litter.puppies.find(p => p.id === e.target.value);
                                    if (puppy) setSelectedPuppy(puppy);
                                  }}
                                >
                                  <option value="" disabled>Select a puppy</option>
                                  {litter.puppies.map(puppy => (
                                    <option key={puppy.id} value={puppy.id}>
                                      {puppy.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="value">{logType === 'weight' ? 'Weight (kg)' : 'Height (cm)'}</Label>
                                <Input
                                  id="value"
                                  type="number"
                                  step="0.01"
                                  value={newEntry.value}
                                  onChange={(e) => setNewEntry({ value: e.target.value })}
                                  placeholder={logType === 'weight' ? '0.00 kg' : '0.0 cm'}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleLogEntry}>Save Entry</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Current Weight</TableHead>
                            <TableHead>Current Height</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {litter.puppies.map(puppy => {
                            const latestWeight = puppy.weightLog.length > 0 
                              ? puppy.weightLog[puppy.weightLog.length - 1].weight 
                              : 0;
                              
                            const latestHeight = puppy.heightLog.length > 0
                              ? puppy.heightLog[puppy.heightLog.length - 1].height
                              : 0;
                              
                            return (
                              <TableRow key={puppy.id}>
                                <TableCell>{puppy.name}</TableCell>
                                <TableCell>{puppy.gender}</TableCell>
                                <TableCell>{puppy.color}</TableCell>
                                <TableCell>{latestWeight} kg</TableCell>
                                <TableCell>{latestHeight} cm</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handlePuppySelect(puppy)}
                                  >
                                    View Growth
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
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
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No Litters Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first litter to start tracking puppies</p>
            <Button onClick={handleAddLitterClick}>Add Your First Litter</Button>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default MyLitters;
