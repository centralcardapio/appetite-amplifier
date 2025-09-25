import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Trophy } from "lucide-react";

interface PopularPlansProps {
  plans: Array<{ plan: string; count: number }>;
}

const planDisplayNames: Record<string, string> = {
  'Plano Básico': 'Plano Básico',
  'Plano Pro': 'Plano Pro',
  'Plano Premium': 'Plano Premium',
};

const getPlanColor = (index: number) => {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))", 
    "hsl(var(--chart-3))"
  ];
  return colors[index % colors.length];
};

const getPlanIcon = (index: number) => {
  const icons = [Crown, Star, Trophy];
  const Icon = icons[index % icons.length];
  return <Icon className="h-4 w-4" />;
};

export const PopularPlans = ({ plans }: PopularPlansProps) => {
  const maxCount = Math.max(...plans.map(p => p.count), 1);
  const totalPlans = plans.reduce((sum, plan) => sum + plan.count, 0);

  if (!plans || plans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Planos Mais Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhum plano contratado no período selecionado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Planos Mais Populares
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {plans.map((plan, index) => {
          const percentage = (plan.count / maxCount) * 100;
          const sharePercentage = ((plan.count / totalPlans) * 100).toFixed(1);
          
          return (
            <div key={plan.plan} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPlanIcon(index)}
                  <span className="font-medium">
                    {planDisplayNames[plan.plan] || plan.plan}
                  </span>
                  {index === 0 && <Badge variant="secondary" className="text-xs">Líder</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{plan.count}</span>
                  <span className="text-xs text-muted-foreground">({sharePercentage}%)</span>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{
                  '--progress-background': getPlanColor(index)
                } as React.CSSProperties}
              />
            </div>
          );
        })}
        
        {plans.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getPlanIcon(0)}
                <span className="font-medium">
                  Plano Líder: {planDisplayNames[plans[0]?.plan] || plans[0]?.plan}
                </span>
              </div>
              <Badge variant="outline">
                {plans[0]?.count} contratos
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};