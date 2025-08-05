import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ArrowUpDown, Calendar } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface ActivePenListViewProps {
  onCleanPen: (penId: string) => void;
}

type SortField = 'penName' | 'penBrand' | 'inkName' | 'inkBrand' | 'daysSinceInked';
type SortDirection = 'asc' | 'desc';

export const ActivePenListView = ({ onCleanPen }: ActivePenListViewProps) => {
  const { getActivePens } = useSupabaseData();
  const [sortField, setSortField] = useState<SortField>('daysSinceInked');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const activePens = getActivePens();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getDaysColor = (days: number) => {
    if (days <= 7) return 'text-green-600';
    if (days <= 21) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedActivePens = [...activePens].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortField) {
      case 'penName':
        aValue = a.pen.name.toLowerCase();
        bValue = b.pen.name.toLowerCase();
        break;
      case 'penBrand':
        aValue = a.pen.brand.toLowerCase();
        bValue = b.pen.brand.toLowerCase();
        break;
      case 'inkName':
        aValue = a.ink.name.toLowerCase();
        bValue = b.ink.name.toLowerCase();
        break;
      case 'inkBrand':
        aValue = a.ink.brand.toLowerCase();
        bValue = b.ink.brand.toLowerCase();
        break;
      case 'daysSinceInked':
        aValue = a.daysSinceInked;
        bValue = b.daysSinceInked;
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="penName">Pen Name</SortableHeader>
            <SortableHeader field="penBrand">Pen Brand</SortableHeader>
            <TableHead>Nib Size</TableHead>
            <SortableHeader field="inkName">Ink Name</SortableHeader>
            <SortableHeader field="inkBrand">Ink Brand</SortableHeader>
            <TableHead>Color</TableHead>
            <SortableHeader field="daysSinceInked">Days Inked</SortableHeader>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedActivePens.map(({ pen, ink, daysSinceInked }) => (
            <TableRow key={pen.id}>
              <TableCell className="font-medium">{pen.name}</TableCell>
              <TableCell>{pen.brand}</TableCell>
              <TableCell>
                <Badge variant="outline">{pen.nibSize}</Badge>
              </TableCell>
              <TableCell>{ink.name}</TableCell>
              <TableCell>{ink.brand}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{ink.color}</span>
                  {ink.primaryColor && (
                    <div 
                      className="w-4 h-4 rounded-full border border-border" 
                      style={{ backgroundColor: ink.primaryColor }}
                    />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <Badge variant="outline" className={getDaysColor(daysSinceInked)}>
                    {daysSinceInked} days
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCleanPen(pen.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clean
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};