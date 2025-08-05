import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";
import { PenData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface PenListViewProps {
  pens: PenData[];
  onEdit: (pen: PenData) => void;
  onDelete: (penId: string) => void;
}

type SortField = 'name' | 'brand' | 'model' | 'type' | 'nibSize' | 'purchaseDate' | 'price';
type SortDirection = 'asc' | 'desc';

export const PenListView = ({ pens, onEdit, onDelete }: PenListViewProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { formatPrice } = useCurrency();
  const { getLastInkedInfo, getLastCleanedDate } = useSupabaseData();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPens = [...pens].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'price') {
      aValue = parseFloat(a.price) || 0;
      bValue = parseFloat(b.price) || 0;
    } else if (sortField === 'purchaseDate') {
      aValue = new Date(a.purchaseDate).getTime();
      bValue = new Date(b.purchaseDate).getTime();
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
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
            <SortableHeader field="name">Name</SortableHeader>
            <SortableHeader field="brand">Brand</SortableHeader>
            <SortableHeader field="model">Model</SortableHeader>
            <SortableHeader field="type">Type</SortableHeader>
            <SortableHeader field="nibSize">Nib</SortableHeader>
            <TableHead>Last Inked</TableHead>
            <TableHead>Last Cleaned</TableHead>
            <SortableHeader field="purchaseDate">Purchase Date</SortableHeader>
            <SortableHeader field="price">Price</SortableHeader>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPens.map((pen) => {
            const lastInkedInfo = getLastInkedInfo(pen.id);
            const lastCleanedDate = getLastCleanedDate(pen.id);
            
            return (
              <TableRow key={pen.id}>
                <TableCell className="font-medium">{pen.name}</TableCell>
                <TableCell>{pen.brand}</TableCell>
                <TableCell>{pen.model}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{pen.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{pen.nibSize}</Badge>
                </TableCell>
                <TableCell>
                  {lastInkedInfo ? (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{lastInkedInfo.ink.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(lastInkedInfo.date).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  {lastCleanedDate ? (
                    <span className="text-sm">
                      {new Date(lastCleanedDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Never</span>
                  )}
                </TableCell>
                <TableCell>{new Date(pen.purchaseDate).toLocaleDateString()}</TableCell>
                <TableCell>{formatPrice(pen.price)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(pen)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(pen.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};