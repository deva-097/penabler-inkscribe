import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, Droplets, Clock, Star, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const { pens, inks, inkingEvents, getActivePens, getNeglectedPens, getPenById, getInkById } = useSupabaseData();

  const activePens = getActivePens();
  const neglectedPens = getNeglectedPens();

  // Find most active pen and ink (by frequency of inking events)
  const penEventCount = inkingEvents.reduce((acc, event) => {
    if (event.eventType === 'inked' || event.eventType === 're-inked') {
      acc[event.penId] = (acc[event.penId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const inkEventCount = inkingEvents.reduce((acc, event) => {
    if (event.inkId && (event.eventType === 'inked' || event.eventType === 're-inked')) {
      acc[event.inkId] = (acc[event.inkId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const mostUsedPenId = Object.keys(penEventCount).reduce((a, b) => 
    penEventCount[a] > penEventCount[b] ? a : b, Object.keys(penEventCount)[0]
  );

  const mostUsedInkId = Object.keys(inkEventCount).reduce((a, b) => 
    inkEventCount[a] > inkEventCount[b] ? a : b, Object.keys(inkEventCount)[0]
  );

  const favoritePen = mostUsedPenId ? getPenById(mostUsedPenId) : null;
  const favoriteInk = mostUsedInkId ? getInkById(mostUsedInkId) : null;

  // Find longest inked pen
  const longestInkedPen = activePens.reduce((longest, current) => 
    current.daysSinceInked > (longest?.daysSinceInked || 0) ? current : longest, 
    activePens[0] || null
  );

  const recentEvents = inkingEvents
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Quick stats for overview cards
  const quickStats = [
    {
      title: "Total Pens",
      value: pens.length,
      icon: PenTool,
      description: "in collection"
    },
    {
      title: "Total Inks", 
      value: inks.length,
      icon: Droplets,
      description: "in collection"
    },
    {
      title: "Active Pens",
      value: activePens.length,
      icon: Calendar,
      description: "currently inked"
    },
    {
      title: "Neglected",
      value: neglectedPens.length,
      icon: AlertTriangle,
      description: "unused 90+ days"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Penabler</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track your pen inking activities and manage your fountain pen rotation efficiently.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => {
                if (stat.title === "Total Pens") onViewChange('pens');
                else if (stat.title === "Total Inks") onViewChange('inks');
                else if (stat.title === "Active Pens") onViewChange('active-pens');
                else if (stat.title === "Neglected") onViewChange('neglected-pens');
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Pen Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your fountain pen collection. Add new pens, edit details, and organize your writing instruments.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onViewChange('pens')}>
                View Collection
              </Button>
              <Button size="sm" variant="outline" onClick={() => onViewChange('pens')}>
                Add Pen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Ink Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Catalog your ink collection. Track colors, brands, and discover new favorites for your pens.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onViewChange('inks')}>
                View Collection
              </Button>
              <Button size="sm" variant="outline" onClick={() => onViewChange('inks')}>
                Add Ink
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Inking Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track when you ink and clean your pens. Manage your active pen rotation and usage patterns.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onViewChange('inking-history')}>
                View History
              </Button>
              <Button size="sm" variant="outline" onClick={() => onViewChange('active-pens')}>
                Active Pens
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Events and Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Events - Takes 1/3 */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => {
                  const pen = getPenById(event.penId);
                  const ink = event.inkId ? getInkById(event.inkId) : null;
                  return (
                    <div key={event.id} className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{pen?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.eventType === 'cleaned' ? 'Cleaned' : ink?.name}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(event.date).toLocaleDateString()}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No recent events</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insights Section - Takes 2/3 */}
        <div className="md:col-span-2">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-medium">Insights</CardTitle>
              <Star className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Most Active Pen */}
                {favoritePen && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Most Active Pen</span>
                    </div>
                    <p className="font-semibold text-sm">{favoritePen.name}</p>
                    <p className="text-xs text-muted-foreground">{favoritePen.brand} - {favoritePen.model}</p>
                    <Badge variant="secondary" className="text-xs">
                      {penEventCount[mostUsedPenId]} inkings
                    </Badge>
                  </div>
                )}

                {/* Most Used Ink */}
                {favoriteInk && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Most Used Ink</span>
                    </div>
                    <p className="font-semibold text-sm">{favoriteInk.name}</p>
                    <p className="text-xs text-muted-foreground">{favoriteInk.brand} - {favoriteInk.color}</p>
                    <Badge variant="secondary" className="text-xs">
                      {inkEventCount[mostUsedInkId]} inkings
                    </Badge>
                  </div>
                )}

                {/* Longest Inked Pen */}
                {longestInkedPen && (
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Longest Inked</span>
                    </div>
                    <p className="font-semibold text-sm">{longestInkedPen.pen.name}</p>
                    <p className="text-xs text-muted-foreground">{longestInkedPen.ink.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {longestInkedPen.daysSinceInked} days
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};