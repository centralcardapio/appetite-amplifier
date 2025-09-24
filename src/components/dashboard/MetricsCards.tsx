import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Image, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricsCardsProps {
  data: {
    totalUsers: number;
    totalTransformations: number;
    totalCreditsUsed: number;
    totalRevenue: number;
    newUsersToday: number;
    transformationsToday: number;
  };
}

export const MetricsCards = ({ data }: MetricsCardsProps) => {
  const metrics = [
    {
      title: "Usuários Totais",
      value: data.totalUsers.toLocaleString('pt-BR'),
      icon: Users,
      change: `+${data.newUsersToday} hoje`,
      changeType: data.newUsersToday > 0 ? 'positive' : 'neutral',
      color: 'text-blue-600'
    },
    {
      title: "Transformações",
      value: data.totalTransformations.toLocaleString('pt-BR'),
      icon: Image,
      change: `+${data.transformationsToday} hoje`,
      changeType: data.transformationsToday > 0 ? 'positive' : 'neutral',
      color: 'text-green-600'
    },
    {
      title: "Créditos Utilizados",
      value: data.totalCreditsUsed.toLocaleString('pt-BR'),
      icon: CreditCard,
      change: `${((data.totalCreditsUsed / data.totalUsers) || 0).toFixed(1)} por usuário`,
      changeType: 'neutral',
      color: 'text-purple-600'
    },
    {
      title: "Receita Total",
      value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      change: `R$ ${(data.totalRevenue / (data.totalUsers || 1)).toFixed(2)} por usuário`,
      changeType: 'positive',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <span>{metric.change}</span>
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
                'hsl(25 95% 53%)'
              } 0%, transparent 100%)`
            }}
          />
        </Card>
      ))}
    </div>
  );
};