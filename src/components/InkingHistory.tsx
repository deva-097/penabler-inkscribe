import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Droplets, Trash2, Edit, Plus } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { InkingForm } from "./InkingForm";
import { InkingEvent } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useViewMode } from "@/hooks/useViewMode";
import { ViewToggle } from "@/components/ui/view-toggle";
import { CalendarView } from "@/components/CalendarView";

export const InkingHistory = () => {
  const { inkingEvents, pens, inks, getPenById, getInkById, addInkingEvent, updateInkingEvent, deleteInkingEvent } = useSupabaseData();
  const { toast } = useToast();
  const [isCalendarView, setIsCalendarView] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<InkingEvent | null>(null);
  const [formData, setFormData] = useState<Partial<InkingEvent>>({});

  const filteredEvents = inkingEvents
    .filter(event => {
      const pen = getPenById(event.penId);
      const ink = event.inkId ? getInkById(event.inkId) : null;
      const searchMatch = !searchTerm || 
        pen?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pen?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ink?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ink?.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const typeMatch = eventTypeFilter === "all" || event.eventType === eventTypeFilter;
      
      return searchMatch && typeMatch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const handleEditEvent = (event: InkingEvent) => {
    setEditingEvent(event);
    setFormData(event);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !formData.penId || !formData.date || !formData.eventType) return;
    
    updateInkingEvent(formData as InkingEvent);
    setEditingEvent(null);
    setFormData({});
    toast({
      title: "Event Updated",
      description: "Inking event has been updated successfully.",
    });
  };

  const handleDeleteEvent = (id: string) => {
    deleteInkingEvent(id);
    toast({
      title: "Event Deleted",
      description: "Inking event has been deleted.",
    });
  };

  const getEventTypeColor = (eventType: InkingEvent['eventType']) => {
    switch (eventType) {
      case 'inked': return 'bg-blue-500';
      case 'cleaned': return 'bg-gray-500';
      case 're-inked': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (eventType: InkingEvent['eventType']) => {
    switch (eventType) {
      case 'inked': return 'Inked';
      case 'cleaned': return 'Cleaned';
      case 're-inked': return 'Re-inked';
      default: return eventType;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Inking History</h1>
        <div className="flex items-center gap-4">
          <ViewToggle 
            viewMode={isCalendarView ? 'card' : 'list'} 
            onViewModeChange={() => setIsCalendarView(!isCalendarView)} 
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Event
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder="Search by pen or ink..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:max-w-xs"
        />
        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="md:max-w-xs">
            <SelectValue placeholder="Filter by event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="inked">Inked</SelectItem>
            <SelectItem value="cleaned">Cleaned</SelectItem>
            <SelectItem value="re-inked">Re-inked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCalendarView ? (
        <CalendarView />
      ) : (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No inking events found</p>
                  <p>Start by logging your first pen inking event!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => {
            const pen = getPenById(event.penId);
            const ink = event.inkId ? getInkById(event.inkId) : null;
            
            return (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getEventTypeColor(event.eventType)}>
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(event.date)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium">
                          {pen?.name} ({pen?.brand})
                        </p>
                        {ink && (
                          <p className="text-sm text-muted-foreground">
                            {ink.name} ({ink.brand}) - {ink.color}
                          </p>
                        )}
                        {event.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            "{event.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })
          )}
        </div>
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

      <Dialog open={!!editingEvent} onOpenChange={(open) => {
        if (!open) {
          setEditingEvent(null);
          setFormData({});
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Inking Event</DialogTitle>
          </DialogHeader>
          <InkingForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateEvent}
            onCancel={() => {
              setEditingEvent(null);
              setFormData({});
            }}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};