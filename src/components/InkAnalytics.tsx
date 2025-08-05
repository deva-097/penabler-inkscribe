import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3, Sparkles } from "lucide-react";
import { InkData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ChartCard } from "@/components/analytics/ChartCard";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";

interface InkAnalyticsProps {
  inks: InkData[];
}

// Modern gradient color palette for charts
const CHART_COLORS = [
  'hsl(var(--chart-1))', // Purple
  'hsl(var(--chart-2))', // Cyan
  'hsl(var(--chart-3))', // Yellow
  'hsl(var(--chart-4))', // Orange
  'hsl(var(--chart-5))', // Green
  'hsl(var(--chart-6))', // Pink
  'hsl(var(--chart-7))', // Light Purple
  'hsl(var(--chart-8))', // Light Yellow
];

const COLOR_MAP: Record<string, string> = {
  "Black": "#000000",
  "Blue": "#0066CC", 
  "Blue Black": "#1B1B3A",
  "Red": "#DC143C",
  "Green": "#228B22",
  "Purple": "#800080",
  "Brown": "#8B4513",
  "Orange": "#FF8C00",
  "Pink": "#FF69B4",
  "Teal": "#008080",
  "Grey": "#808080",
  "Other": "#666666"
};

export const InkAnalytics = ({ inks }: InkAnalyticsProps) => {
  const { currency } = useCurrency();
  const analytics = useMemo(() => {
    if (inks.length === 0) return null;

    // Color distribution
    const colorCounts = inks.reduce((acc, ink) => {
      acc[ink.color] = (acc[ink.color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colorData = Object.entries(colorCounts).map(([color, count]) => ({
      name: color,
      value: count,
      percentage: ((count / inks.length) * 100).toFixed(1)
    }));

    // Brand distribution
    const brandCounts = inks.reduce((acc, ink) => {
      acc[ink.brand] = (acc[ink.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const brandData = Object.entries(brandCounts).map(([brand, count]) => ({
      name: brand,
      value: count,
      percentage: ((count / inks.length) * 100).toFixed(1)
    }));

    // Spend by year analysis
    const spendByYearData = inks.reduce((acc, ink) => {
      if (ink.purchaseDate && ink.price) {
        const year = new Date(ink.purchaseDate).getFullYear();
        const price = parseFloat(ink.price.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(year) && !isNaN(price)) {
          acc[year] = (acc[year] || 0) + price;
        }
      }
      return acc;
    }, {} as Record<number, number>);

    // Fill in missing years to show complete timeline
    const years = Object.keys(spendByYearData).map(Number);
    if (years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      for (let year = minYear; year <= maxYear; year++) {
        if (!(year in spendByYearData)) {
          spendByYearData[year] = 0;
        }
      }
    }

    const spendByYear = Object.entries(spendByYearData)
      .map(([year, amount]) => ({
        year: parseInt(year),
        amount: amount,
        formattedAmount: `${currency.symbol}${amount.toFixed(2)}`
      }))
      .sort((a, b) => a.year - b.year);

    return {
      colorData,
      brandData,
      spendByYear
    };
  }, [inks, currency]);

  if (!analytics) return null;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central" 
        fontSize="11"
        fontWeight="600"
        className="drop-shadow-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="font-semibold text-card-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
          <BarChart3 className="h-4 w-4" />
          Analytics
          <Sparkles className="h-3 w-3 opacity-60" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="analytics-header rounded-lg p-6 mb-6">
          <DialogTitle className="text-2xl font-bold gradient-text font-serif">Ink Collection Analytics</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Comprehensive visual breakdown of your ink collection by color and brand
          </DialogDescription>
        </DialogHeader>
        
        {/* Summary Dashboard */}
        <AnalyticsSummary pens={[]} inks={inks} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Distribution */}
          <ChartCard 
            title="Color Distribution" 
            description="Your ink collection by color families"
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analytics.colorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={110}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {analytics.colorData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLOR_MAP[entry.name] || CHART_COLORS[index % CHART_COLORS.length]}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Brand Distribution */}
          <ChartCard 
            title="Brand Distribution" 
            description="Your ink collection by manufacturer"
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.brandData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="url(#brandGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Spend by Year */}
          <ChartCard 
            title="Spend by Year" 
            description="Your ink investment timeline"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.spendByYear} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="inkSpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="year"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  formatter={(value: number) => [`${currency.symbol}${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="url(#inkSpendGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </DialogContent>
    </Dialog>
  );
};