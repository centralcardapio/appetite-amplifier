import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface PaymentAnalyticsProps {
  paymentStats: {
    pending: number;
    confirmed: number;
    totalValue: number;
  };
}

export const PaymentAnalytics = ({ paymentStats }: PaymentAnalyticsProps) => {
  const totalPayments = paymentStats.pending + paymentStats.confirmed;
  const confirmationRate = totalPayments > 0 ? (paymentStats.confirmed / totalPayments) * 100 : 0;
  const averageValue = paymentStats.confirmed > 0 ? paymentStats.totalValue / paymentStats.confirmed : 0;

  const stats = [
    {
      label: "Pagamentos Confirmados",
      value: paymentStats.confirmed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Pagamentos Pendentes", 
      value: paymentStats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      label: "Taxa de Conversão",
      value: `${confirmationRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Ticket Médio",
      value: `R$ ${averageValue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600", 
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Análise Financeira
        </CardTitle>
        <Badge variant="secondary">
          R$ {(paymentStats.totalValue / 100).toLocaleString('pt-BR', { 
            minimumFractionDigits: 2 
          })}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <div className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Conversion Rate Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxa de Conversão</span>
              <span className="font-medium">{confirmationRate.toFixed(1)}%</span>
            </div>
            <Progress value={confirmationRate} className="h-2" />
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Distribuição de Pagamentos</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Confirmados</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{paymentStats.confirmed}</div>
                <div className="text-xs text-muted-foreground">
                  {totalPayments > 0 ? ((paymentStats.confirmed / totalPayments) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Pendentes</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{paymentStats.pending}</div>
                <div className="text-xs text-muted-foreground">
                  {totalPayments > 0 ? ((paymentStats.pending / totalPayments) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          {paymentStats.totalValue > 0 && (
            <div className="pt-3 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  R$ {(paymentStats.totalValue / 100).toLocaleString('pt-BR', { 
                    minimumFractionDigits: 2 
                  })}
                </div>
                <div className="text-xs text-muted-foreground">Receita Total</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};