
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer } from 'lucide-react';

interface TemperatureLogOverviewProps {
  onLogTemperature: () => void;
}

const TemperatureLogOverview: React.FC<TemperatureLogOverviewProps> = ({ onLogTemperature }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Log</CardTitle>
        <CardDescription>Monitor bitch temperature</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Thermometer className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Temperature Data</h3>
          <p className="text-muted-foreground mb-4">Record temperature readings</p>
          <Button onClick={onLogTemperature}>Log Temperature</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureLogOverview;
