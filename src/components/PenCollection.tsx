import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Edit, Trash2, Calendar, Pen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { PenData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PenForm } from "@/components/PenForm";
import { usePenForm } from "@/contexts/PenFormContext";
import { useViewMode } from "@/hooks/useViewMode";
import { ViewToggle } from "@/components/ui/view-toggle";
import { PenListView } from "@/components/PenListView";
import { PenAnalytics } from "@/components/PenAnalytics";

const PenCollection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPen, setEditingPen] = useState<PenData | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();
  const { pens, addPen, updatePen, deletePen, getLastInkedInfo, getLastCleanedDate } = useSupabaseData();
  const { formatPrice } = useCurrency();
  const { formData, setFormData, resetForm, markFormClean } = usePenForm();
  const { viewMode, setViewMode } = useViewMode({ storageKey: 'pen-collection-view' });

  const handleAddPen = () => {
    addPen(formData);
    setIsAddDialogOpen(false);
    resetForm();
    markFormClean();
    toast({
      title: "Pen Added",
      description: `${formData.brand} ${formData.model} has been added to your collection.`
    });
  };

  const handleEditPen = (pen: PenData) => {
    setEditingPen(pen);
    setFormData({
      name: pen.name,
      brand: pen.brand,
      model: pen.model,
      type: pen.type,
      nibSize: pen.nibSize,
      era: pen.era,
      nibMaterial: pen.nibMaterial,
      color: pen.color,
      purchaseDate: pen.purchaseDate,
      price: pen.price,
      notes: pen.notes,
      fillingMechanism: pen.fillingMechanism || '',
      yearOfMake: pen.yearOfMake || ''
    });
  };

  const handleUpdatePen = () => {
    if (!editingPen) return;
    
    updatePen({ ...formData, id: editingPen.id });
    setEditingPen(null);
    resetForm();
    markFormClean();
    toast({
      title: "Pen Updated",
      description: `${formData.brand} ${formData.model} has been updated.`
    });
  };

  const handleDeletePen = (penId: string) => {
    const penToDelete = pens.find(pen => pen.id === penId);
    deletePen(penId);
    toast({
      title: "Pen Deleted",
      description: `${penToDelete?.brand} ${penToDelete?.model} has been removed from your collection.`
    });
  };

  const filteredPens = pens.filter(pen => {
    const matchesSearch = pen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pen.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pen.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pen.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || pen.era === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Pen Collection</h1>
          <p className="text-muted-foreground">
            Manage and explore your fountain pens • {pens.length} pen{pens.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PenAnalytics pens={pens} />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Pen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Pen</DialogTitle>
              <DialogDescription>
                Add a new pen to your collection with all the details.
              </DialogDescription>
            </DialogHeader>
            <PenForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddPen}
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
            placeholder="Search pens by brand, model, or color..."
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
            <SelectItem value="all">All Eras</SelectItem>
            <SelectItem value="Vintage">Vintage</SelectItem>
            <SelectItem value="Modern">Modern</SelectItem>
            <SelectItem value="Antique">Antique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pen Collection View */}
      {filteredPens.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPens.map((pen) => {
              const lastInkedInfo = getLastInkedInfo(pen.id);
              const lastCleanedDate = getLastCleanedDate(pen.id);
              
              return (
                <Card key={pen.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pen.name}</CardTitle>
                        <CardDescription>{pen.brand} {pen.model}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPen(pen)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePen(pen.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{pen.type}</Badge>
                        <Badge variant="outline">{pen.nibSize}</Badge>
                        <Badge variant="outline">{pen.era}</Badge>
                        <Badge variant="outline">{pen.nibMaterial}</Badge>
                        {pen.color && <Badge variant="outline">{pen.color}</Badge>}
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Purchased {new Date(pen.purchaseDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm font-mono">{formatPrice(pen.price).charAt(0)}</span>
                          <span>{formatPrice(pen.price)}</span>
                        </div>
                        
                        {/* Activity Information */}
                        {lastInkedInfo && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <span className="text-xs">Last inked: {lastInkedInfo.ink.name} ({new Date(lastInkedInfo.date).toLocaleDateString()})</span>
                          </div>
                        )}
                        {lastCleanedDate && (
                          <div className="flex items-center gap-2 text-green-600">
                            <span className="text-xs">Last cleaned: {new Date(lastCleanedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    
                      {pen.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pen.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <PenListView 
            pens={filteredPens} 
            onEdit={handleEditPen} 
            onDelete={handleDeletePen} 
          />
        )
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {searchTerm || filterType !== "all" ? "No Matching Pens" : "No Pens Yet"}
            </CardTitle>
            <CardDescription>
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start building your collection by adding your first fountain pen"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Pen className="h-8 w-8 text-muted-foreground" />
              </div>
              {(!searchTerm && filterType === "all") && (
                <>
                  <p className="text-muted-foreground max-w-md">
                    Add details about your fountain pens including brand, model, nib size, 
                    purchase information, and notes to keep track of your collection.
                  </p>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Pen
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPen} onOpenChange={() => setEditingPen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Pen</DialogTitle>
            <DialogDescription>
              Update the details of your pen.
            </DialogDescription>
          </DialogHeader>
          <PenForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdatePen}
            onCancel={() => {
              setEditingPen(null);
              resetForm();
            }}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PenCollection;