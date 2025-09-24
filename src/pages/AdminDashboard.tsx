import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Image, CreditCard, TrendingUp, Calendar, Star } from "lucide-react";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { UsageCharts } from "@/components/dashboard/UsageCharts";
import { PopularStyles } from "@/components/dashboard/PopularStyles";
import { RecentTransformations } from "@/components/dashboard/RecentTransformations";
import { PaymentAnalytics } from "@/components/dashboard/PaymentAnalytics";

interface DashboardData {
  totalUsers: number;
  totalTransformations: number;
  totalCreditsUsed: number;
  totalRevenue: number;
  newUsersToday: number;
  transformationsToday: number;
  popularStyles: Array<{ style: string; count: number }>;
  recentTransformations: Array<any>;
  paymentStats: {
    pending: number;
    confirmed: number;
    totalValue: number;
  };
  usageByDay: Array<{ date: string; transformations: number; users: number }>;
}

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AdminDashboard useEffect - user:', user, 'loading:', loading);
    if (!loading) {
      if (user) {
        console.log('User authenticated, fetching dashboard data');
        fetchDashboardData();
      } else {
        console.log('No user authenticated');
        setIsLoading(false);
      }
    }
  }, [user, loading]);

  const fetchDashboardData = async () => {
    console.log('Starting fetchDashboardData');
    try {
      setIsLoading(true);

      // Fetch all data in parallel
      const [
        usersResult,
        transformationsResult,
        creditsResult,
        creditPurchasesResult,
        stylesResult,
        recentResult
      ] = await Promise.all([
        // Total users from photo_credits table
        supabase
          .from('photo_credits')
          .select('user_id, created_at'),
        
        // Total transformations and today's count
        supabase
          .from('photo_transformations')
          .select('id, created_at, status'),
        
        // Credits usage
        supabase
          .from('credit_usage_history')
          .select('amount_used'),
        
        // Credit purchases data
        supabase
          .from('credit_purchases')
          .select('user_id, amount, purchase_type, created_at'),
        
        // Popular styles
        supabase
          .from('user_styles')
          .select('selected_style'),
        
        // Recent transformations
        supabase
          .from('photo_transformations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      console.log('Data fetched:', {
        users: usersResult.data?.length,
        transformations: transformationsResult.data?.length,
        credits: creditsResult.data?.length,
        purchases: creditPurchasesResult.data?.length,
        styles: stylesResult.data?.length
      });

      const today = new Date().toISOString().split('T')[0];
      
      // Process users data
      const users = usersResult.data || [];
      const newUsersToday = users.filter(u => u.created_at.startsWith(today)).length;
      
      // Process transformations data
      const transformations = transformationsResult.data || [];
      const transformationsToday = transformations.filter(t => 
        t.created_at.startsWith(today)
      ).length;

      // Process credits data
      const totalCreditsUsed = (creditsResult.data || [])
        .reduce((sum, credit) => sum + credit.amount_used, 0);

      // Process credit purchases for revenue
      const creditPurchases = creditPurchasesResult.data || [];
      const paidPurchases = creditPurchases.filter(p => p.purchase_type === 'paid');
      const totalRevenue = paidPurchases.length * 10; // Estimate R$10 per purchase
      
      const paymentStats = {
        pending: 0, // Not tracking payments table for now
        confirmed: paidPurchases.length,
        totalValue: totalRevenue * 100 // Convert to cents for consistency
      };

      // Process popular styles
      const styles = stylesResult.data || [];
      const styleCount = styles.reduce((acc, style) => {
        acc[style.selected_style] = (acc[style.selected_style] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const popularStyles = Object.entries(styleCount)
        .map(([style, count]) => ({ style, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Generate usage by day (last 7 days)
      const usageByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransformations = transformations.filter(t => 
          t.created_at.startsWith(dateStr)
        ).length;

        usageByDay.push({
          date: dateStr,
          transformations: dayTransformations,
          users: Math.floor(dayTransformations * 0.7) // Estimate unique users
        });
      }

      console.log('Dashboard data prepared, setting state');
      setDashboardData({
        totalUsers: users.length,
        totalTransformations: transformations.length,
        totalCreditsUsed,
        totalRevenue: paymentStats.totalValue / 100, // Convert from cents
        newUsersToday,
        transformationsToday,
        popularStyles,
        recentTransformations: recentResult.data || [],
        paymentStats,
        usageByDay
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };


  console.log('AdminDashboard render - loading:', loading, 'isLoading:', isLoading, 'user:', !!user, 'dashboardData:', !!dashboardData);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você precisa estar logado para acessar o dashboard administrativo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe as métricas e performance da plataforma
            </p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString('pt-BR')}
          </Badge>
        </div>

        {/* Metrics Cards */}
        {dashboardData ? (
          <MetricsCards data={dashboardData} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dashboardData ? (
            <>
              <UsageCharts data={dashboardData.usageByDay} />
              <PopularStyles styles={dashboardData.popularStyles} />
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dashboardData ? (
            <>
              <RecentTransformations transformations={dashboardData.recentTransformations} />
              <PaymentAnalytics paymentStats={dashboardData.paymentStats} />
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;