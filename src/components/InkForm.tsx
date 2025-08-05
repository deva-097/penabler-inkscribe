import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { InkData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

const COLOR_OPTIONS = [
  { label: "Black", value: "Black", color: "#000000" },
  { label: "Blue", value: "Blue", color: "#0066CC" },
  { label: "Blue Black", value: "Blue Black", color: "#1B1B3A" },
  { label: "Red", value: "Red", color: "#DC143C" },
  { label: "Green", value: "Green", color: "#228B22" },
  { label: "Purple", value: "Purple", color: "#800080" },
  { label: "Brown", value: "Brown", color: "#8B4513" },
  { label: "Orange", value: "Orange", color: "#FF8C00" },
  { label: "Pink", value: "Pink", color: "#FF69B4" },
  { label: "Teal", value: "Teal", color: "#008080" },
  { label: "Grey", value: "Grey", color: "#808080" },
  { label: "Other", value: "Other", color: "#666666" },
];

interface InkFormProps {
  formData: Omit<InkData, 'id'>;
  setFormData: (data: Omit<InkData, 'id'>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const InkForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }: InkFormProps) => {
  const { currency } = useCurrency();

  const handleInputChange = (field: keyof Omit<InkData, 'id'>, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleColorChange = (colorValue: string) => {
    const selectedColor = COLOR_OPTIONS.find(option => option.value === colorValue);
    setFormData({
      ...formData,
      color: colorValue,
      primaryColor: selectedColor?.color || undefined
    });
  };

  const isFormValid = formData.name && formData.brand && formData.type && 
                      formData.color && formData.volume && formData.purchaseDate;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter ink name"
          />
        </div>
        <div>
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            placeholder="Enter brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type *</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            placeholder="e.g., Fountain Pen Ink"
          />
        </div>
        <div>
          <Label htmlFor="color">Color *</Label>
          <Select value={formData.color} onValueChange={handleColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent className="bg-popover border">
              {COLOR_OPTIONS.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color.color }}
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="volume">Volume *</Label>
          <Input
            id="volume"
            value={formData.volume}
            onChange={(e) => handleInputChange('volume', e.target.value)}
            placeholder="e.g., 50ml"
          />
        </div>
        <div>
          <Label htmlFor="price">Price ({currency.symbol})</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="purchaseDate">Purchase Date *</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
          />
        </div>
      </div>

      {/* Ink Properties */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Ink Properties</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="waterproof" className="text-sm">Waterproof</Label>
            <Switch
              id="waterproof"
              checked={formData.waterproof}
              onCheckedChange={(checked) => handleInputChange('waterproof', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sheen" className="text-sm">Sheen</Label>
            <Switch
              id="sheen"
              checked={formData.sheen}
              onCheckedChange={(checked) => handleInputChange('sheen', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="shimmer" className="text-sm">Shimmer</Label>
            <Switch
              id="shimmer"
              checked={formData.shimmer}
              onCheckedChange={(checked) => handleInputChange('shimmer', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="shading" className="text-sm">Shading</Label>
            <Switch
              id="shading"
              checked={formData.shading}
              onCheckedChange={(checked) => handleInputChange('shading', checked)}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSubmit} disabled={!isFormValid} className="flex-1">
          {isEditing ? 'Update Ink' : 'Add Ink'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};