import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, PenTool } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface NeglectedPensProps {
  onViewChange: (view: string) => void;
}

export const NeglectedPens = ({ onViewChange }: NeglectedPensProps) => {
  const { getNeglectedPens, getPenStatus } = useSupabaseData();
  
  const neglectedPens = getNeglectedPens();

  const getDaysUnused = (penId: string): number => {
    const status = getPenStatus(penId);
    const lastActivity = status.lastInkedDate || status.lastCleanedDate;
    
    if (!lastActivity) return 999; // No activity ever
    
    const lastDate = new Date(lastActivity);
    const today = new Date();
    return Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Neglected Pens</h1>
          <p className="text-muted-foreground">
            Pens that haven't been used or cleaned in over 90 days
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {neglectedPens.length} Neglected
          </Badge>
          <Button onClick={() => onViewChange('pens')}>
            <PenTool className="h-4 w-4 mr-2" />
            View All Pens
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {neglectedPens.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <PenTool className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Neglected Pens!</h3>
              <p className="text-muted-foreground text-center">
                All your pens have been used or cleaned within the last 90 days.
              </p>
            </CardContent>
          </Card>
        ) : (
          neglectedPens.map((pen) => {
            const daysUnused = getDaysUnused(pen.id);
            const status = getPenStatus(pen.id);
            
            return (
              <Card key={pen.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{pen.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {pen.brand} {pen.model} • {pen.nibSize}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <Badge variant="secondary">
                        {daysUnused === 999 ? 'Never used' : `${daysUnused} days`}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          Last activity: {
                            status.lastInkedDate || status.lastCleanedDate 
                              ? new Date(status.lastInkedDate || status.lastCleanedDate!).toLocaleDateString()
                              : 'Never'
                          }
                        </span>
                      </div>
                      {pen.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          {pen.notes}
                        </p>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => onViewChange('inking-history')}
                    >
                      Ink Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};