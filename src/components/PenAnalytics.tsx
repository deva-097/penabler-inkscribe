import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3, Sparkles } from "lucide-react";
import { PenData } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ChartCard } from "@/components/analytics/ChartCard";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";

interface PenAnalyticsProps {
  pens: PenData[];
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

export const PenAnalytics = ({ pens }: PenAnalyticsProps) => {
  const { currency } = useCurrency();
  const analytics = useMemo(() => {
    if (pens.length === 0) return null;

    // Brand distribution
    const brandCounts = pens.reduce((acc, pen) => {
      acc[pen.brand] = (acc[pen.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const brandData = Object.entries(brandCounts).map(([brand, count]) => ({
      name: brand,
      value: count,
      percentage: ((count / pens.length) * 100).toFixed(1)
    }));

    // Nib grind distribution
    const nibSizeCounts = pens.reduce((acc, pen) => {
      acc[pen.nibSize] = (acc[pen.nibSize] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nibSizeData = Object.entries(nibSizeCounts).map(([nibSize, count]) => ({
      name: nibSize,
      value: count,
      percentage: ((count / pens.length) * 100).toFixed(1)
    }));

    // Filling mechanism distribution
    const fillingMechanismCounts = pens.reduce((acc, pen) => {
      const mechanism = pen.fillingMechanism || 'Unknown';
      acc[mechanism] = (acc[mechanism] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const fillingMechanismData = Object.entries(fillingMechanismCounts).map(([mechanism, count]) => ({
      name: mechanism,
      value: count,
      percentage: ((count / pens.length) * 100).toFixed(1)
    }));

    // Nib material distribution
    const nibMaterialCounts = pens.reduce((acc, pen) => {
      acc[pen.nibMaterial] = (acc[pen.nibMaterial] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nibMaterialData = Object.entries(nibMaterialCounts).map(([material, count]) => ({
      name: material,
      value: count,
      percentage: ((count / pens.length) * 100).toFixed(1)
    }));

    // Era distribution
    const eraCounts = pens.reduce((acc, pen) => {
      acc[pen.era] = (acc[pen.era] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eraData = Object.entries(eraCounts).map(([era, count]) => ({
      name: era,
      value: count,
      percentage: ((count / pens.length) * 100).toFixed(1)
    }));

    // Country distribution
    const countryCounts = pens.reduce((acc, pen) => {
      const country = pen.countryOfOrigin || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countryData = Object.entries(countryCounts).map(([country, count]) => ({
      name: country,
      value: count,
      percentage: ((count / pens.length) * 100).toFixed(1)
    }));

    // Spend by year analysis
    const spendByYearData = pens.reduce((acc, pen) => {
      if (pen.purchaseDate && pen.price) {
        const year = new Date(pen.purchaseDate).getFullYear();
        const price = parseFloat(pen.price.replace(/[^0-9.-]+/g, ''));
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
      brandData,
      nibSizeData,
      fillingMechanismData,
      nibMaterialData,
      eraData,
      countryData,
      spendByYear
    };
  }, [pens, currency]);

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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="analytics-header rounded-lg p-6 mb-6">
          <DialogTitle className="text-2xl font-bold gradient-text font-serif">Pen Collection Analytics</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Comprehensive visual breakdown of your fountain pen collection
          </DialogDescription>
        </DialogHeader>
        
        {/* Summary Dashboard */}
        <AnalyticsSummary pens={pens} inks={[]} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {/* Brand Distribution */}
          <ChartCard 
            title="Brand Distribution" 
            description="Your pen collection by manufacturer"
            className="lg:col-span-1"
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analytics.brandData}
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
                  {analytics.brandData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
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

          {/* Nib Grind Distribution */}
          <ChartCard 
            title="Nib Size Distribution" 
            description="Distribution of nib sizes in your collection"
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.nibSizeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="nibGradient" x1="0" y1="0" x2="0" y2="1">
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
                  height={80}
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
                  fill="url(#nibGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Filling Mechanism Distribution */}
          <ChartCard 
            title="Filling Mechanism" 
            description="How your pens are filled"
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analytics.fillingMechanismData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={110}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={800}
                >
                  {analytics.fillingMechanismData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
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

          {/* Nib Material Distribution */}
          <ChartCard 
            title="Nib Material" 
            description="Materials used in your pen nibs"
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.nibMaterialData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="materialGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                  fill="url(#materialGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Era Distribution */}
          <ChartCard 
            title="Era Distribution" 
            description="When your pens were made"
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.eraData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="eraGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                  fill="url(#eraGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1400}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Country Distribution */}
          <ChartCard 
            title="Country of Origin" 
            description="Where your pens were manufactured"
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analytics.countryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={110}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={400}
                  animationDuration={800}
                >
                  {analytics.countryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
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

          {/* Spend by Year */}
          <ChartCard 
            title="Spend by Year" 
            description="Your pen investment timeline"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.spendByYear} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.2}/>
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
                  fill="url(#spendGradient)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1600}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </DialogContent>
    </Dialog>
  );
};