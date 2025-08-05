import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

const NIB_SIZE_OPTIONS = [
  "Extra Fine", "Fine", "Medium", "Broad", "Double Broad", 
  "Cursive Italic", "Oblique", "Other"
];

const ERA_OPTIONS = ["Vintage", "Modern", "Antique"];

const NIB_MATERIAL_OPTIONS = ["Steel", "14K Gold", "18K Gold", "21K Gold", "Titanium"];

const FILLING_MECHANISM_OPTIONS = [
  "C/C filler", "eyedropper only", "piston", "vaccum fill", 
  "sac - aerometric", "sac - vaccumatic", "sac - lever", "other"
];

const COUNTRY_OPTIONS = [
  "United States", "Germany", "Italy", "Japan", "United Kingdom", 
  "France", "China", "India", "Taiwan", "South Korea", "Other"
];

interface PenFormProps {
  formData: Omit<PenData, 'id'>;
  setFormData: (data: Omit<PenData, 'id'>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const PenForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }: PenFormProps) => {
  const { currency } = useCurrency();

  const handleInputChange = (field: keyof Omit<PenData, 'id'>, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const isFormValid = formData.name && formData.brand && formData.model && 
                      formData.type && formData.nibSize && formData.era && 
                      formData.nibMaterial && formData.purchaseDate;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter pen name"
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
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            placeholder="Enter model"
          />
        </div>
        <div>
          <Label htmlFor="type">Type *</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            placeholder="e.g., Fountain Pen"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="nibSize">Nib Grind *</Label>
          <Select value={formData.nibSize} onValueChange={(value) => handleInputChange('nibSize', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select nib size" />
            </SelectTrigger>
            <SelectContent className="bg-popover border">
              {NIB_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="era">Era *</Label>
          <Select value={formData.era} onValueChange={(value) => handleInputChange('era', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select era" />
            </SelectTrigger>
            <SelectContent className="bg-popover border">
              {ERA_OPTIONS.map((era) => (
                <SelectItem key={era} value={era}>
                  {era}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="nibMaterial">Nib Material *</Label>
          <Select value={formData.nibMaterial} onValueChange={(value) => handleInputChange('nibMaterial', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent className="bg-popover border">
              {NIB_MATERIAL_OPTIONS.map((material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fillingMechanism">Filling Mechanism</Label>
          <Select value={formData.fillingMechanism} onValueChange={(value) => handleInputChange('fillingMechanism', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select filling mechanism" />
            </SelectTrigger>
            <SelectContent className="bg-popover border">
              {FILLING_MECHANISM_OPTIONS.map((mechanism) => (
                <SelectItem key={mechanism} value={mechanism}>
                  {mechanism}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            placeholder="Enter color"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="yearOfMake">Year of Make</Label>
          <Input
            id="yearOfMake"
            value={formData.yearOfMake || ''}
            onChange={(e) => handleInputChange('yearOfMake', e.target.value)}
            placeholder="e.g., 2023"
          />
        </div>
        <div>
          <Label htmlFor="countryOfOrigin">Country of Origin</Label>
          <Select value={formData.countryOfOrigin} onValueChange={(value) => handleInputChange('countryOfOrigin', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="bg-popover border">
              {COUNTRY_OPTIONS.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          {isEditing ? 'Update Pen' : 'Add Pen'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};