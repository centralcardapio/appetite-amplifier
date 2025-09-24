import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Mail, Palette, Camera, CreditCard } from "lucide-react";

interface ConversionFunnelProps {
  data: {
    totalSignups: number;
    emailConfirmed: number;
    styleSelected: number;
    tested: number;
    purchasedCredits: number;
  };
}

export const ConversionFunnel = ({ data }: ConversionFunnelProps) => {
  const steps = [
    {
      label: "Cadastro",
      value: data.totalSignups,
      icon: Users,
      color: "bg-blue-500",
      percentage: 100
    },
    {
      label: "Confirmação de E-mail",
      value: data.emailConfirmed,
      icon: Mail,
      color: "bg-green-500",
      percentage: data.totalSignups > 0 ? (data.emailConfirmed / data.totalSignups) * 100 : 0
    },
    {
      label: "Seleção de Estilo",
      value: data.styleSelected,
      icon: Palette,
      color: "bg-purple-500",
      percentage: data.totalSignups > 0 ? (data.styleSelected / data.totalSignups) * 100 : 0
    },
    {
      label: "Testou",
      value: data.tested,
      icon: Camera,
      color: "bg-orange-500",
      percentage: data.totalSignups > 0 ? (data.tested / data.totalSignups) * 100 : 0
    },
    {
      label: "Comprou Créditos",
      value: data.purchasedCredits,
      icon: CreditCard,
      color: "bg-red-500",
      percentage: data.totalSignups > 0 ? (data.purchasedCredits / data.totalSignups) * 100 : 0
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <step.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{step.value.toLocaleString('pt-BR')}</div>
                <div className="text-xs text-muted-foreground">
                  {step.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="relative">
              <Progress value={step.percentage} className="h-2" />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full ${step.color}`}
                style={{ width: `${step.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};