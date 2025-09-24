import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

interface UsageChartsProps {
  data: Array<{
    date: string;
    transformations: number;
    newSignups: number;
    reprocessingRate: number;
  }>;
}

export const UsageCharts = ({ data }: UsageChartsProps) => {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  const chartConfig = {
    transformations: {
      label: "Transformações",
      color: "hsl(var(--primary))",
    },
    newSignups: {
      label: "Novos Cadastros",
      color: "hsl(142 76% 36%)",
    },
    reprocessingRate: {
      label: "Reprocessamento (%)",
      color: "hsl(0 84% 60%)",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Novos Cadastros e Transformações</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="transformations"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="newSignups"
                stroke="hsl(142 76% 36%)"
                fill="hsl(142 76% 36%)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="reprocessingRate"
                stroke="hsl(0 84% 60%)"
                fill="hsl(0 84% 60%)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Transformações</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142 76% 36%)' }} />
            <span className="text-xs text-muted-foreground">Novos Cadastros</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0 84% 60%)' }} />
            <span className="text-xs text-muted-foreground">Reprocessamento (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};