import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, Info, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PenData, InkData, InkingEvent } from '@/types';

interface ImportResult {
  type: 'pen' | 'ink' | 'event';
  data: any;
  status: 'valid' | 'warning' | 'error';
  warnings: string[];
  errors: string[];
  rowIndex: number;
}

interface ImportSummary {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  results: ImportResult[];
}

export const DataImport: React.FC = () => {
  const [csvData, setCsvData] = useState('');
  const [importType, setImportType] = useState<'pen' | 'ink' | 'event'>('pen');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addPen, addInk, addInkingEvent } = useSupabaseData();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string): string[][] => {
    const lines = csvText.trim().split('\n');
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const applySmartDefaults = (data: any, type: 'pen' | 'ink' | 'event'): any => {
    const defaults = {
      pen: {
        fillingMechanism: null,
        yearOfMake: null,
        countryOfOrigin: null,
        notes: '',
      },
      ink: {
        primaryColor: null,
        notes: '',
        waterproof: false,
        sheen: false,
        shimmer: false,
        shading: false,
      },
      event: {
        notes: '',
      }
    };

    return { ...defaults[type], ...data };
  };

  const validateRow = (row: string[], headers: string[], type: 'pen' | 'ink' | 'event', rowIndex: number): ImportResult => {
    const result: ImportResult = {
      type,
      data: {},
      status: 'valid',
      warnings: [],
      errors: [],
      rowIndex
    };

    // Create data object from row
    const data: any = {};
    headers.forEach((header, index) => {
      const value = row[index]?.trim() || '';
      const normalizedHeader = header.toLowerCase().replace(/[\s_-]/g, '');
      
      // Map common header variations
      const headerMap: { [key: string]: string } = {
        penname: 'name',
        inkname: 'name',
        pentype: 'type',
        inktype: 'type',
        nibsize: 'nibSize',
        nibmaterial: 'nibMaterial',
        purchasedate: 'purchaseDate',
        fillingmechanism: 'fillingMechanism',
        yearofmake: 'yearOfMake',
        countryoforigin: 'countryOfOrigin',
        primarycolor: 'primaryColor',
        eventtype: 'eventType',
      };

      const mappedHeader = headerMap[normalizedHeader] || normalizedHeader;
      data[mappedHeader] = value;
    });

    // Apply smart defaults
    const processedData = applySmartDefaults(data, type);

    // Validate required fields based on type
    const requiredFields = {
      pen: ['name', 'brand', 'model', 'price'],
      ink: ['name', 'brand', 'color', 'volume', 'price'],
      event: ['eventType', 'date']
    };

    requiredFields[type].forEach(field => {
      if (!processedData[field]) {
        result.errors.push(`Missing required field: ${field}`);
      }
    });

    // Convert boolean fields for inks
    if (type === 'ink') {
      ['waterproof', 'sheen', 'shimmer', 'shading'].forEach(field => {
        if (processedData[field] && typeof processedData[field] === 'string') {
          const value = processedData[field].toLowerCase();
          processedData[field] = value === 'true' || value === 'yes' || value === '1';
        }
      });
    }

    // Warn about missing optional fields
    const optionalFields = {
      pen: ['nibSize', 'era', 'nibMaterial', 'color', 'purchaseDate', 'type'],
      ink: ['type', 'purchaseDate'],
      event: ['penId', 'inkId']
    };

    optionalFields[type].forEach(field => {
      if (!processedData[field]) {
        result.warnings.push(`Optional field "${field}" will use default value`);
      }
    });

    // Set status based on errors/warnings
    if (result.errors.length > 0) {
      result.status = 'error';
    } else if (result.warnings.length > 0) {
      result.status = 'warning';
    }

    result.data = processedData;
    return result;
  };

  const processCSV = () => {
    if (!csvData.trim()) {
      toast({
        title: 'No Data',
        description: 'Please paste CSV data or upload a file.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const rows = parseCSV(csvData);
      if (rows.length < 2) {
        throw new Error('CSV must contain at least a header row and one data row');
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      const results: ImportResult[] = dataRows.map((row, index) => 
        validateRow(row, headers, importType, index + 2) // +2 for header and 1-based indexing
      );

      const summary: ImportSummary = {
        totalRows: results.length,
        validRows: results.filter(r => r.status === 'valid').length,
        warningRows: results.filter(r => r.status === 'warning').length,
        errorRows: results.filter(r => r.status === 'error').length,
        results
      };

      setImportSummary(summary);
      setShowPreview(true);

      toast({
        title: 'CSV Processed',
        description: `Found ${summary.totalRows} rows. ${summary.validRows + summary.warningRows} can be imported.`,
      });
    } catch (error: any) {
      toast({
        title: 'Processing Error',
        description: error.message || 'Failed to process CSV data',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeImport = async () => {
    if (!importSummary) return;

    setIsImporting(true);
    let imported = 0;
    let skipped = 0;

    try {
      const importableResults = importSummary.results.filter(r => r.status !== 'error');
      
      for (const result of importableResults) {
        let success = false;
        
        try {
          switch (result.type) {
            case 'pen':
              success = await addPen(result.data);
              break;
            case 'ink':
              success = await addInk(result.data);
              break;
            case 'event':
              success = await addInkingEvent(result.data);
              break;
          }
          
          if (success) {
            imported++;
          } else {
            skipped++;
          }
        } catch (error) {
          skipped++;
        }

        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${imported} items. ${skipped} items were skipped.`,
      });

      // Reset state
      setCsvData('');
      setImportSummary(null);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'An error occurred during import',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templates = {
      pen: 'name,brand,model,type,nibSize,era,nibMaterial,color,purchaseDate,price,notes,fillingMechanism,yearOfMake,countryOfOrigin\n"Pilot Custom 823","Pilot","Custom 823","Fountain Pen","Medium","Modern","Gold","Black","2024-01-15","$275","Excellent demonstrator pen","Vacuum","2023","Japan"',
      ink: 'name,brand,type,color,volume,purchaseDate,price,notes,waterproof,sheen,shimmer,shading,primaryColor\n"Kon-Peki","Pilot","Fountain Pen Ink","Blue","50ml","2024-01-15","$12","Beautiful blue ink","false","true","false","true","#1e40af"',
      event: 'eventType,date,notes,penName,inkName\n"inked","2024-01-15","First fill","Pilot Custom 823","Kon-Peki"'
    };

    const content = templates[importType];
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${importType}-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Data Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Import your fountain pen data from CSV files or Google Sheets. Missing optional fields will use smart defaults.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center">
            <Label>Data Type</Label>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <Tabs value={importType} onValueChange={(value) => setImportType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pen">Pens</TabsTrigger>
              <TabsTrigger value="ink">Inks</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pen" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Required: name, brand, model, price | Optional: type, nibSize, era, nibMaterial, color, purchaseDate, notes, fillingMechanism, yearOfMake, countryOfOrigin
              </div>
            </TabsContent>
            
            <TabsContent value="ink" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Required: name, brand, color, volume, price | Optional: type, purchaseDate, notes, waterproof, sheen, shimmer, shading, primaryColor
              </div>
            </TabsContent>
            
            <TabsContent value="event" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Required: eventType, date | Optional: notes, penName, inkName
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload CSV File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="mt-1"
              />
            </div>

            <div className="relative">
              <Label htmlFor="csv-data">Or Paste CSV Data</Label>
              <Textarea
                id="csv-data"
                placeholder={`Paste your CSV data here...\nExample:\nname,brand,model,price\n"Pilot Custom 823","Pilot","Custom 823","$275"`}
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={6}
                className="mt-1 font-mono text-sm"
              />
            </div>

            <Button 
              onClick={processCSV} 
              disabled={!csvData.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <FileText className="h-4 w-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Process CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPreview && importSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Import Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{importSummary.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{importSummary.validRows}</div>
                <div className="text-sm text-muted-foreground">Valid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{importSummary.warningRows}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{importSummary.errorRows}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {importSummary.errorRows > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {importSummary.errorRows} rows have errors and will be skipped. Only valid rows and rows with warnings will be imported.
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Preview</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importSummary.results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.rowIndex}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={result.status === 'valid' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}
                        >
                          {result.status === 'valid' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {result.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {result.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {result.data.name || result.data.eventType || 'Unnamed'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {result.warnings.map((warning, i) => (
                            <div key={i} className="text-xs text-yellow-600">⚠ {warning}</div>
                          ))}
                          {result.errors.map((error, i) => (
                            <div key={i} className="text-xs text-red-600">✗ {error}</div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={executeImport} 
                disabled={isImporting || (importSummary.validRows + importSummary.warningRows) === 0}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-bounce" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {importSummary.validRows + importSummary.warningRows} Items
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPreview(false);
                  setImportSummary(null);
                }}
                disabled={isImporting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};