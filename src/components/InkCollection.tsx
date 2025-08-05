import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Edit, Trash2, Calendar, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { InkData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { InkForm } from "@/components/InkForm";
import { useViewMode } from "@/hooks/useViewMode";
import { ViewToggle } from "@/components/ui/view-toggle";
import { InkListView } from "@/components/InkListView";
import { InkAnalytics } from "@/components/InkAnalytics";

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

const getTextColor = (colorValue: string): string => {
  const darkColors = ['Black', 'Blue', 'Blue Black', 'Purple', 'Brown', 'Grey', 'Teal'];
  return darkColors.includes(colorValue) ? '#ffffff' : '#000000';
};

const InkCollection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInk, setEditingInk] = useState<InkData | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();
  const { inks, addInk, updateInk, deleteInk } = useSupabaseData();
  const { formatPrice } = useCurrency();
  const { viewMode, setViewMode } = useViewMode({ storageKey: 'ink-collection-view' });

  const [formData, setFormData] = useState<Omit<InkData, 'id'>>({
    name: "",
    brand: "",
    type: "Fountain Pen Ink",
    color: "",
    primaryColor: "",
    volume: "0",
    purchaseDate: "",
    price: "0",
    notes: "",
    waterproof: false,
    sheen: false,
    shimmer: false,
    shading: false
  });

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      type: "Fountain Pen Ink",
      color: "",
      primaryColor: "",
      volume: "0",
      purchaseDate: "",
      price: "0",
      notes: "",
      waterproof: false,
      sheen: false,
      shimmer: false,
      shading: false
    });
  };

  const handleAddInk = () => {
    addInk(formData);
    setIsAddDialogOpen(false);
    resetForm();
    toast({
      title: "Ink Added",
      description: `${formData.brand} ${formData.name} has been added to your collection.`
    });
  };

  const handleEditInk = (ink: InkData) => {
    setEditingInk(ink);
    setFormData({
      name: ink.name,
      brand: ink.brand,
      type: ink.type,
      color: ink.color,
      primaryColor: ink.primaryColor || "",
      volume: ink.volume,
      purchaseDate: ink.purchaseDate,
      price: ink.price,
      notes: ink.notes,
      waterproof: ink.waterproof,
      sheen: ink.sheen,
      shimmer: ink.shimmer,
      shading: ink.shading
    });
  };

  const handleUpdateInk = () => {
    if (!editingInk) return;
    
    updateInk({ ...formData, id: editingInk.id });
    setEditingInk(null);
    resetForm();
    toast({
      title: "Ink Updated",
      description: `${formData.brand} ${formData.name} has been updated.`
    });
  };

  const handleDeleteInk = (inkId: string) => {
    const inkToDelete = inks.find(ink => ink.id === inkId);
    deleteInk(inkId);
    toast({
      title: "Ink Deleted",
      description: `${inkToDelete?.brand} ${inkToDelete?.name} has been removed from your collection.`
    });
  };

  const filteredInks = inks.filter(ink => {
    const matchesSearch = ink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ink.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ink.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || ink.color === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Ink Collection</h1>
          <p className="text-muted-foreground">
            Manage and explore your inks • {inks.length} ink{inks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <InkAnalytics inks={inks} />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Ink
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Ink</DialogTitle>
              <DialogDescription>
                Add a new ink to your collection with all the details.
              </DialogDescription>
            </DialogHeader>
            <InkForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddInk}
              onCancel={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inks by name, brand, or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colors</SelectItem>
            <SelectItem value="Black">Black</SelectItem>
            <SelectItem value="Blue">Blue</SelectItem>
            <SelectItem value="Blue Black">Blue Black</SelectItem>
            <SelectItem value="Red">Red</SelectItem>
            <SelectItem value="Green">Green</SelectItem>
            <SelectItem value="Purple">Purple</SelectItem>
            <SelectItem value="Brown">Brown</SelectItem>
            <SelectItem value="Orange">Orange</SelectItem>
            <SelectItem value="Pink">Pink</SelectItem>
            <SelectItem value="Teal">Teal</SelectItem>
            <SelectItem value="Grey">Grey</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ink Collection View */}
      {filteredInks.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInks.map((ink) => (
            <Card key={ink.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{ink.name}</CardTitle>
                    <CardDescription>{ink.brand}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditInk(ink)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteInk(ink.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{ink.type}</Badge>
                    <Badge variant="outline">{ink.volume}ml</Badge>
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
                    {ink.waterproof && <Badge variant="outline" className="bg-blue-100 text-blue-800">Waterproof</Badge>}
                    {ink.sheen && <Badge variant="outline" className="bg-purple-100 text-purple-800">Sheen</Badge>}
                    {ink.shimmer && <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Shimmer</Badge>}
                    {ink.shading && <Badge variant="outline" className="bg-green-100 text-green-800">Shading</Badge>}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Purchased {new Date(ink.purchaseDate).toLocaleDateString()}</span>
                    </div>
                     <div className="flex items-center gap-2">
                       <span className="text-muted-foreground text-sm font-mono">{formatPrice(ink.price).charAt(0)}</span>
                       <span>{formatPrice(ink.price)}</span>
                     </div>
                  </div>
                  
                  {ink.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ink.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        ) : (
          <InkListView 
            inks={filteredInks} 
            onEdit={handleEditInk} 
            onDelete={handleDeleteInk} 
          />
        )
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {searchTerm || filterType !== "all" ? "No Matching Inks" : "No Inks Yet"}
            </CardTitle>
            <CardDescription>
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start building your collection by adding your first ink"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Droplets className="h-8 w-8 text-muted-foreground" />
              </div>
              {(!searchTerm && filterType === "all") && (
                <>
                  <p className="text-muted-foreground max-w-md">
                    Add details about your inks including brand, color, volume, 
                    purchase information, and notes to keep track of your collection.
                  </p>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Ink
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingInk} onOpenChange={() => setEditingInk(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Ink</DialogTitle>
            <DialogDescription>
              Update the details of your ink.
            </DialogDescription>
          </DialogHeader>
          <InkForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateInk}
            onCancel={() => {
              setEditingInk(null);
              resetForm();
            }}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InkCollection;