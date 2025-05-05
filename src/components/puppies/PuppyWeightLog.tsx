
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import { isMobileDevice } from '@/utils/fetchUtils';

interface PuppyWeightLogProps {
  puppies: Puppy[];
}

const PuppyWeightLog: React.FC<PuppyWeightLogProps> = ({ puppies }) => {
  const [page, setPage] = useState(1);
  const logsPerPage = isMobileDevice() ? 5 : 10;
  
  // If there are no puppies or no weight logs, show limited UI
  if (!puppies.length || !puppies[0]?.weightLog?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Log</CardTitle>
          <CardDescription>No weight data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Get the total number of weight log entries
  const totalLogs = puppies[0]?.weightLog?.length || 0;
  const totalPages = Math.ceil(totalLogs / logsPerPage);
  
  // Calculate the logs to display for the current page
  const startIdx = (page - 1) * logsPerPage;
  const endIdx = Math.min(startIdx + logsPerPage, totalLogs);
  const visibleLogs = [...Array(endIdx - startIdx)].map((_, i) => startIdx + i);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Weight Log</CardTitle>
            <CardDescription>Weight tracking for all puppies</CardDescription>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {page} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {puppies.map(puppy => (
                <TableHead key={puppy.id}>{puppy.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleLogs.map(logIndex => {
              const date = puppies[0].weightLog[logIndex].date;
              return (
                <TableRow key={date}>
                  <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
                  {puppies.map(puppy => (
                    <TableCell key={puppy.id}>
                      {puppy.weightLog[logIndex]?.weight || '-'} kg
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PuppyWeightLog;
