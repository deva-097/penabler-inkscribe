import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, Award } from "lucide-react";
import { PenData, InkData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AnalyticsSummaryProps {
  pens: PenData[];
  inks: InkData[];
}

export const AnalyticsSummary = ({ pens, inks }: AnalyticsSummaryProps) => {
  const { currency } = useCurrency();

  const totalPens = pens.length;
  const totalInks = inks.length;

  // Calculate total value
  const totalPenValue = pens.reduce((sum, pen) => {
    if (pen.price) {
      const price = parseFloat(pen.price.replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(price) ? 0 : price);
    }
    return sum;
  }, 0);

  const totalInkValue = inks.reduce((sum, ink) => {
    if (ink.price) {
      const price = parseFloat(ink.price.replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(price) ? 0 : price);
    }
    return sum;
  }, 0);

  const totalValue = totalPenValue + totalInkValue;

  // Calculate average values
  const avgPenValue = totalPens > 0 ? totalPenValue / totalPens : 0;
  const avgInkValue = totalInks > 0 ? totalInkValue / totalInks : 0;

  // Find most expensive items
  const mostExpensivePen = pens.reduce((max, pen) => {
    if (!pen.price) return max;
    const price = parseFloat(pen.price.replace(/[^0-9.-]+/g, ''));
    if (isNaN(price)) return max;
    return price > max.value ? { name: `${pen.brand} ${pen.model}`, value: price } : max;
  }, { name: 'N/A', value: 0 });

  const mostExpensiveInk = inks.reduce((max, ink) => {
    if (!ink.price) return max;
    const price = parseFloat(ink.price.replace(/[^0-9.-]+/g, ''));
    if (isNaN(price)) return max;
    return price > max.value ? { name: `${ink.brand} ${ink.color}`, value: price } : max;
  }, { name: 'N/A', value: 0 });

  // Calculate recent acquisitions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentPens = pens.filter(pen => 
    pen.purchaseDate && new Date(pen.purchaseDate) > thirtyDaysAgo
  ).length;

  const recentInks = inks.filter(ink => 
    ink.purchaseDate && new Date(ink.purchaseDate) > thirtyDaysAgo
  ).length;

  const metrics = [
    {
      title: "Total Collection Value",
      value: `${currency.symbol}${totalValue.toFixed(2)}`,
      description: "Combined value of pens and inks",
      icon: DollarSign,
      trend: totalValue > 1000 ? "up" : "neutral",
      trendValue: totalValue > 0 ? "Active collection" : "No data",
      className: "metric-card",
    },
    {
      title: "Total Items",
      value: (totalPens + totalInks).toString(),
      description: `${totalPens} pens, ${totalInks} inks`,
      icon: Package,
      trend: "up",
      trendValue: `${recentPens + recentInks} recent`,
      className: "metric-card",
    },
    {
      title: "Average Pen Value",
      value: `${currency.symbol}${avgPenValue.toFixed(2)}`,
      description: "Average cost per pen",
      icon: TrendingUp,
      trend: avgPenValue > 100 ? "up" : "neutral",
      trendValue: totalPens > 0 ? "Per pen" : "No data",
      className: "metric-card",
    },
    {
      title: "Most Expensive Pen",
      value: mostExpensivePen.value > 0 ? `${currency.symbol}${mostExpensivePen.value.toFixed(2)}` : "N/A",
      description: mostExpensivePen.name,
      icon: Award,
      trend: "neutral",
      trendValue: mostExpensivePen.value > 0 ? "Collection highlight" : "No data",
      className: "metric-card",
    },
    {
      title: "Recent Acquisitions",
      value: (recentPens + recentInks).toString(),
      description: "Items added in last 30 days",
      icon: Calendar,
      trend: recentPens + recentInks > 0 ? "up" : "neutral",
      trendValue: recentPens + recentInks > 0 ? "Last 30 days" : "No recent items",
      className: "metric-card",
    },
    {
      title: "Collection Diversity",
      value: `${new Set(pens.map(p => p.brand)).size + new Set(inks.map(i => i.brand)).size}`,
      description: "Unique brands in collection",
      icon: TrendingUp,
      trend: "up",
      trendValue: "Total brands",
      className: "metric-card",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in">
      {metrics.map((metric, index) => (
        <Card key={metric.title} className={`${metric.className} animate-scale-in`} style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
            <div className="flex items-center mt-2">
              {metric.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : metric.trend === "down" ? (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              ) : null}
              <span className="text-xs text-muted-foreground">
                {metric.trendValue}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};