import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Droplets, Calendar, Trash2, Plus } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useToast } from "@/hooks/use-toast";
import { InkingForm } from "./InkingForm";
import { InkingEvent } from "@/types";
import { useViewMode } from "@/hooks/useViewMode";
import { ViewToggle } from "@/components/ui/view-toggle";
import { ActivePenListView } from "@/components/ActivePenListView";

export const ActivePens = () => {
  const { getActivePens, addInkingEvent } = useSupabaseData();
  const { toast } = useToast();
  const { viewMode, setViewMode } = useViewMode({ storageKey: 'active-pens-view' });
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InkingEvent>>({});
  
  const activePens = getActivePens();

  const handleCleanPen = (penId: string) => {
    addInkingEvent({
      penId,
      inkId: null,
      eventType: 'cleaned',
      date: new Date().toISOString().split('T')[0],
      notes: 'Cleaned via Active Pens dashboard'
    });
    
    toast({
      title: "Pen Cleaned",
      description: "Pen has been marked as cleaned and is now available for inking.",
    });
  };

  const handleAddEvent = () => {
    if (!formData.penId || !formData.date || !formData.eventType) return;
    
    addInkingEvent(formData as Omit<InkingEvent, 'id'>);
    setIsAddDialogOpen(false);
    setFormData({});
    toast({
      title: "Event Added",
      description: "Inking event has been recorded successfully.",
    });
  };

  const getDaysColor = (days: number) => {
    if (days <= 7) return 'text-green-600';
    if (days <= 21) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Currently Inked Pens</h1>
        <div className="flex items-center gap-4">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {activePens.length} Active
          </Badge>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Event
          </Button>
        </div>
      </div>

      {activePens.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No pens currently inked</p>
              <p>Ink some pens to start tracking their usage!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activePens.map(({ pen, ink, daysSinceInked }) => (
            <Card key={pen.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>{pen.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getDaysColor(daysSinceInked)}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {daysSinceInked} days
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCleanPen(pen.id)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clean
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pen:</span>
                    <span>{pen.brand} - {pen.model}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Nib:</span>
                    <span>{pen.nibSize}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ink:</span>
                    <span>{ink.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Color:</span>
                    <div className="flex items-center gap-2">
                      <span>{ink.color}</span>
                      <Badge variant="secondary" className="text-xs">
                        {ink.brand}
                      </Badge>
                    </div>
                  </div>
                  {daysSinceInked > 21 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-xs text-yellow-800">
                        This pen has been inked for over 3 weeks. Consider cleaning to prevent ink from drying.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        ) : (
          <ActivePenListView onCleanPen={handleCleanPen} />
        )
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Inking Event</DialogTitle>
          </DialogHeader>
          <InkingForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleAddEvent}
            onCancel={() => {
              setIsAddDialogOpen(false);
              setFormData({});
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};