import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { InkingEvent } from "@/types";

interface InkingFormProps {
  formData: Partial<InkingEvent>;
  setFormData: (data: Partial<InkingEvent>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const InkingForm = ({ formData, setFormData, onSubmit, onCancel, isEditing = false }: InkingFormProps) => {
  const { pens, inks, getPenStatus } = useSupabaseData();
  const [selectedEventType, setSelectedEventType] = useState<string>(formData.eventType || 'inked');

  // Set default eventType if not provided
  useEffect(() => {
    if (!formData.eventType) {
      setFormData({ ...formData, eventType: 'inked' });
    }
  }, [formData, setFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType);
    setFormData({ ...formData, eventType: eventType as InkingEvent['eventType'] });
    
    // Clear ink selection if cleaning
    if (eventType === 'cleaned') {
      setFormData({ ...formData, eventType: eventType as InkingEvent['eventType'], inkId: null });
    }
  };

  const getAvailablePens = () => {
    if (selectedEventType === 'inked') {
      // For inking, only show clean pens
      return pens.filter(pen => {
        const status = getPenStatus(pen.id);
        return !status.currentInkId;
      });
    }
    if (selectedEventType === 'cleaned' || selectedEventType === 're-inked') {
      // For cleaning or re-inking, only show currently inked pens
      return pens.filter(pen => {
        const status = getPenStatus(pen.id);
        return status.currentInkId;
      });
    }
    return pens;
  };

  const availablePens = getAvailablePens();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="eventType">Action</Label>
        <Select value={selectedEventType} onValueChange={handleEventTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inked">Ink Pen</SelectItem>
            <SelectItem value="cleaned">Clean Pen</SelectItem>
            <SelectItem value="re-inked">Re-ink Pen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="penId">Pen</Label>
        <Select value={formData.penId || ""} onValueChange={(value) => setFormData({ ...formData, penId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select pen" />
          </SelectTrigger>
          <SelectContent>
            {availablePens.length > 0 ? (
              availablePens.map((pen) => (
                <SelectItem key={pen.id} value={pen.id}>
                  {pen.name} ({pen.brand})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                {selectedEventType === 'inked' ? 'No clean pens available' : 'No inked pens available'}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedEventType !== 'cleaned' && (
        <div className="space-y-2">
          <Label htmlFor="inkId">Ink</Label>
          <Select value={formData.inkId || ""} onValueChange={(value) => setFormData({ ...formData, inkId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select ink" />
            </SelectTrigger>
            <SelectContent>
              {inks.map((ink) => (
                <SelectItem key={ink.id} value={ink.id}>
                  {ink.name} ({ink.brand}) - {ink.color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date || ""}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any notes about this action..."
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={
            !formData.penId || 
            !formData.date || 
            !formData.eventType || 
            (formData.eventType !== 'cleaned' && !formData.inkId)
          }
        >
          {isEditing ? "Update" : "Save"} Event
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};