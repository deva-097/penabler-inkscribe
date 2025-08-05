import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, ArrowUpDown } from "lucide-react";
import { InkData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface InkListViewProps {
  inks: InkData[];
  onEdit: (ink: InkData) => void;
  onDelete: (inkId: string) => void;
}

type SortField = 'name' | 'brand' | 'type' | 'color' | 'volume' | 'purchaseDate' | 'price';
type SortDirection = 'asc' | 'desc';

const getTextColor = (colorValue: string): string => {
  const darkColors = ['Black', 'Blue', 'Blue Black', 'Purple', 'Brown', 'Grey', 'Teal'];
  return darkColors.includes(colorValue) ? '#ffffff' : '#000000';
};

export const InkListView = ({ inks, onEdit, onDelete }: InkListViewProps) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { formatPrice } = useCurrency();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedInks = [...inks].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'price') {
      aValue = parseFloat(a.price) || 0;
      bValue = parseFloat(b.price) || 0;
    } else if (sortField === 'volume') {
      aValue = parseFloat(a.volume) || 0;
      bValue = parseFloat(b.volume) || 0;
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
            <SortableHeader field="type">Type</SortableHeader>
            <SortableHeader field="color">Color</SortableHeader>
            <SortableHeader field="volume">Volume</SortableHeader>
            <TableHead>Properties</TableHead>
            <SortableHeader field="purchaseDate">Purchase Date</SortableHeader>
            <SortableHeader field="price">Price</SortableHeader>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInks.map((ink) => (
            <TableRow key={ink.id}>
              <TableCell className="font-medium">{ink.name}</TableCell>
              <TableCell>{ink.brand}</TableCell>
              <TableCell>
                <Badge variant="secondary">{ink.type}</Badge>
              </TableCell>
              <TableCell>
                {ink.primaryColor ? (
                  <Badge 
                    style={{
                      backgroundColor: ink.primaryColor,
                      color: getTextColor(ink.color)
                    }}
                  >
                    {ink.color}
                  </Badge>
                ) : (
                  <Badge variant="outline">{ink.color}</Badge>
                )}
              </TableCell>
              <TableCell>{ink.volume}ml</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {ink.waterproof && <Badge variant="outline" className="text-xs">Waterproof</Badge>}
                  {ink.sheen && <Badge variant="outline" className="text-xs">Sheen</Badge>}
                  {ink.shimmer && <Badge variant="outline" className="text-xs">Shimmer</Badge>}
                  {ink.shading && <Badge variant="outline" className="text-xs">Shading</Badge>}
                </div>
              </TableCell>
              <TableCell>{new Date(ink.purchaseDate).toLocaleDateString()}</TableCell>
              <TableCell>{formatPrice(ink.price)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(ink)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(ink.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};