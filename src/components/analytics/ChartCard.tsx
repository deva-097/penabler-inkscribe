import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export const ChartCard = ({ title, description, children, className = "" }: ChartCardProps) => {
  return (
    <Card className={`analytics-card animate-slide-up ${className}`}>
      <CardHeader className="analytics-header">
        <CardTitle className="text-lg font-semibold gradient-text">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="chart-container">
        {children}
      </CardContent>
    </Card>
  );
};