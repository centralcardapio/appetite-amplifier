import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Image, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Repeat, ShoppingCart } from "lucide-react";

interface MetricsCardsProps {
  data: {
    newSignups: number;
    totalTransformations: number;
    plansContracted: number;
    totalRevenue: number;
    reprocessingRate: number;
    // Comparison data
    previousPeriod: {
      newSignups: number;
      totalTransformations: number;
      plansContracted: number;
      totalRevenue: number;
      reprocessingRate: number;
    };
  };
}

export const MetricsCards = ({ data }: MetricsCardsProps) => {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeType = (change: number) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const metrics = [
    {
      title: "Novos Cadastros",
      value: data.newSignups.toLocaleString('pt-BR'),
      icon: Users,
      change: calculateChange(data.newSignups, data.previousPeriod.newSignups),
      changeType: getChangeType(calculateChange(data.newSignups, data.previousPeriod.newSignups)),
      color: 'text-blue-600'
    },
    {
      title: "Transformações Realizadas",
      value: data.totalTransformations.toLocaleString('pt-BR'),
      icon: Image,
      change: calculateChange(data.totalTransformations, data.previousPeriod.totalTransformations),
      changeType: getChangeType(calculateChange(data.totalTransformations, data.previousPeriod.totalTransformations)),
      color: 'text-green-600'
    },
    {
      title: "Planos Contratados",
      value: data.plansContracted.toLocaleString('pt-BR'),
      icon: ShoppingCart,
      change: calculateChange(data.plansContracted, data.previousPeriod.plansContracted),
      changeType: getChangeType(calculateChange(data.plansContracted, data.previousPeriod.plansContracted)),
      color: 'text-purple-600'
    },
    {
      title: "Receita Total",
      value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      change: calculateChange(data.totalRevenue, data.previousPeriod.totalRevenue),
      changeType: getChangeType(calculateChange(data.totalRevenue, data.previousPeriod.totalRevenue)),
      color: 'text-orange-600'
    },
    {
      title: "Reprocessamento",
      value: `${data.reprocessingRate.toFixed(1)}%`,
      icon: Repeat,
      change: calculateChange(data.reprocessingRate, data.previousPeriod.reprocessingRate),
      changeType: getChangeType(calculateChange(data.reprocessingRate, data.previousPeriod.reprocessingRate)),
      color: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
              {metric.changeType === 'positive' && (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              )}
              {metric.changeType === 'negative' && (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span>
                {metric.changeType !== 'neutral' && 
                  `${metric.change > 0 ? '+' : ''}${metric.change.toFixed(1)}%`
                }
                {metric.changeType === 'neutral' && 'Sem alteração'}
              </span>
            </div>
          </CardContent>
          
          {/* Gradient background accent */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
            style={{
              background: `linear-gradient(90deg, ${
                metric.color.includes('blue') ? 'hsl(217 91% 60%)' :
                metric.color.includes('green') ? 'hsl(142 76% 36%)' :
                metric.color.includes('purple') ? 'hsl(262 83% 58%)' :
                metric.color.includes('orange') ? 'hsl(25 95% 53%)' :
                'hsl(0 84% 60%)'
              } 0%, transparent 100%)`
            }}
          />
        </Card>
      ))}
    </div>
  );
};