import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { Download, FileDown, Shield, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DataExport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { exportData, pens, inks, inkingEvents } = useSupabaseData();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const dataJson = await exportData();
      const blob = new Blob([dataJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `penabler-backup-${timestamp}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: `Your data has been exported to ${filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to export your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const totalItems = pens.length + inks.length + inkingEvents.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Export & Backup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Export your complete fountain pen collection data as a JSON backup file. 
            This includes all pens, inks, and inking events for safekeeping and portability.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{pens.length}</div>
            <div className="text-sm text-muted-foreground">Pens</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{inks.length}</div>
            <div className="text-sm text-muted-foreground">Inks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{inkingEvents.length}</div>
            <div className="text-sm text-muted-foreground">Events</div>
          </div>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting || totalItems === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <FileDown className="h-4 w-4 mr-2 animate-bounce" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Data ({totalItems} items)
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          The exported file contains your complete collection data in JSON format. 
          Keep this file safe as a backup of your fountain pen collection.
        </p>
      </CardContent>
    </Card>
  );
};