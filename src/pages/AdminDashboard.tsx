import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Image, CreditCard, TrendingUp, Calendar, Star, Shield } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { UsageCharts } from "@/components/dashboard/UsageCharts";
import { RevenueCharts } from "@/components/dashboard/RevenueCharts";
import { PopularStyles } from "@/components/dashboard/PopularStyles";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { RecentTransformations } from "@/components/dashboard/RecentTransformations";
import { UserPhotoViewer } from "@/components/dashboard/UserPhotoViewer";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { MakeAdminButton } from "@/components/MakeAdminButton";

interface DashboardData {
  newSignups: number;
  totalTransformations: number;
  plansContracted: number;
  totalRevenue: number;
  reprocessingRate: number;
  previousPeriod: {
    newSignups: number;
    totalTransformations: number;
    plansContracted: number;
    totalRevenue: number;
    reprocessingRate: number;
  };
  popularStyles: Array<{ style: string; count: number }>;
  recentTransformations: Array<any>;
  paymentStats: {
    pending: number;
    confirmed: number;
    totalValue: number;
  };
  usageByDay: Array<{ 
    date: string; 
    transformations: number; 
    newSignups: number; 
    reprocessingRate: number; 
  }>;
  revenueByDay: Array<{
    date: string;
    plans: number;
    revenue: number;
  }>;
  conversionFunnel: {
    totalSignups: number;
    emailConfirmed: number;
    styleSelected: number;
    tested: number;
    purchasedCredits: number;
  };
}

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default to last 6 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date()
  });

  useEffect(() => {
    console.log('AdminDashboard useEffect - user:', user, 'loading:', loading, 'isAdmin:', isAdmin, 'roleLoading:', roleLoading);
    if (!loading && !roleLoading) {
      if (user && isAdmin) {
        console.log('User authenticated and is admin, fetching dashboard data');
        fetchDashboardData();
      } else {
        console.log('User not authenticated or not admin');
        setIsLoading(false);
      }
    }
  }, [user, loading, isAdmin, roleLoading, dateRange]);

  const fetchDashboardData = async () => {
    console.log('Starting fetchDashboardData');
    if (!dateRange?.from || !dateRange?.to) return;
    
    try {
      setIsLoading(true);

      const startDate = startOfDay(dateRange.from);
      const endDate = endOfDay(dateRange.to);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate comparison period
      const comparisonEndDate = subDays(startDate, 1);
      const comparisonStartDate = subDays(comparisonEndDate, daysDiff - 1);

      // Fetch all data in parallel
      const [
        usersResult,
        transformationsResult,
        creditsResult,
        creditPurchasesResult,
        stylesResult,
        recentResult,
        // Comparison period data
        comparisonUsersResult,
        comparisonTransformationsResult,
        comparisonCreditPurchasesResult
      ] = await Promise.all([
        // Current period - users (new signups)
        supabase
          .from('photo_credits')
          .select('user_id, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        // Current period - transformations
        supabase
          .from('photo_transformations')
          .select('id, created_at, status, reprocessing_count, user_id')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        // Credits usage
        supabase
          .from('credit_usage_history')
          .select('amount_used, used_at')
          .gte('used_at', startDate.toISOString())
          .lte('used_at', endDate.toISOString()),
        
        // Credit purchases data (current period)
        supabase
          .from('credit_purchases')
          .select('user_id, amount, purchase_type, created_at')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        
        // Popular styles
        supabase
          .from('user_styles')
          .select('selected_style'),
        
        // Recent transformations (last 10) with user emails
        supabase
          .from('photo_transformations')
          .select(`
            *,
            photo_credits!inner(user_id)
          `)
          .order('created_at', { ascending: false })
          .limit(10),

        // Comparison period - users
        supabase
          .from('photo_credits')
          .select('user_id, created_at')
          .gte('created_at', comparisonStartDate.toISOString())
          .lte('created_at', comparisonEndDate.toISOString()),

        // Comparison period - transformations
        supabase
          .from('photo_transformations')
          .select('id, created_at, status, reprocessing_count')
          .gte('created_at', comparisonStartDate.toISOString())
          .lte('created_at', comparisonEndDate.toISOString()),

        // Comparison period - credit purchases
        supabase
          .from('credit_purchases')
          .select('user_id, amount, purchase_type, created_at')
          .gte('created_at', comparisonStartDate.toISOString())
          .lte('created_at', comparisonEndDate.toISOString())
      ]);

      console.log('Data fetched:', {
        users: usersResult.data?.length,
        transformations: transformationsResult.data?.length,
        credits: creditsResult.data?.length,
        purchases: creditPurchasesResult.data?.length,
        styles: stylesResult.data?.length
      });

      // Process current period data
      const currentUsers = usersResult.data || [];
      const currentTransformations = transformationsResult.data || [];
      const currentCreditPurchases = creditPurchasesResult.data || [];
      
      // Process comparison period data
      const comparisonUsers = comparisonUsersResult.data || [];
      const comparisonTransformations = comparisonTransformationsResult.data || [];
      const comparisonCreditPurchases = comparisonCreditPurchasesResult.data || [];

      // Calculate metrics
      const newSignups = currentUsers.length;
      const totalTransformations = currentTransformations.length;
      const paidPurchases = currentCreditPurchases.filter(p => p.purchase_type === 'paid');
      const plansContracted = paidPurchases.length;
      const totalRevenue = paidPurchases.length * 10; // Estimate R$10 per purchase
      
      // Calculate reprocessing rate
      const reprocessedCount = currentTransformations.filter(t => t.reprocessing_count > 0).length;
      const reprocessingRate = totalTransformations > 0 ? (reprocessedCount / totalTransformations) * 100 : 0;

      // Calculate comparison metrics
      const comparisonSignups = comparisonUsers.length;
      const comparisonTransformationsCount = comparisonTransformations.length;
      const comparisonPaidPurchases = comparisonCreditPurchases.filter(p => p.purchase_type === 'paid');
      const comparisonPlansContracted = comparisonPaidPurchases.length;
      const comparisonRevenue = comparisonPaidPurchases.length * 10;
      const comparisonReprocessedCount = comparisonTransformations.filter(t => t.reprocessing_count > 0).length;
      const comparisonReprocessingRate = comparisonTransformationsCount > 0 ? (comparisonReprocessedCount / comparisonTransformationsCount) * 100 : 0;

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

      // Generate usage by day
      const usageByDay = [];
      const revenueByDay = [];
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransformations = currentTransformations.filter(t => 
          t.created_at.startsWith(dateStr)
        ).length;

        const daySignups = currentUsers.filter(u => 
          u.created_at.startsWith(dateStr)
        ).length;

        const dayReprocessed = currentTransformations.filter(t => 
          t.created_at.startsWith(dateStr) && t.reprocessing_count > 0
        ).length;

        const dayPlans = paidPurchases.filter(p => 
          p.created_at.startsWith(dateStr)
        ).length;

        const dayRevenue = dayPlans * 10;

        usageByDay.push({
          date: dateStr,
          transformations: dayTransformations,
          newSignups: daySignups,
          reprocessingRate: dayTransformations > 0 ? (dayReprocessed / dayTransformations) * 100 : 0
        });

        revenueByDay.push({
          date: dateStr,
          plans: dayPlans,
          revenue: dayRevenue
        });
      }

      // Get all users who signed up in the period for conversion funnel
      const allSignupsInPeriod = currentUsers;
      const signupUserIds = allSignupsInPeriod.map(u => u.user_id);

      // Get conversion funnel data
      const [stylesInPeriod, transformationsAllTime, purchasesAllTime] = await Promise.all([
        supabase
          .from('user_styles')
          .select('user_id')
          .in('user_id', signupUserIds),
        supabase
          .from('photo_transformations')
          .select('user_id')
          .in('user_id', signupUserIds),
        supabase
          .from('credit_purchases')
          .select('user_id')
          .in('user_id', signupUserIds)
          .neq('purchase_type', 'free')
      ]);

      const conversionFunnel = {
        totalSignups: signupUserIds.length,
        emailConfirmed: signupUserIds.length, // Assume all are confirmed for now
        styleSelected: [...new Set(stylesInPeriod.data?.map(s => s.user_id) || [])].length,
        tested: [...new Set(transformationsAllTime.data?.map(t => t.user_id) || [])].length,
        purchasedCredits: [...new Set(purchasesAllTime.data?.map(p => p.user_id) || [])].length
      };

      const paymentStats = {
        pending: 0,
        confirmed: paidPurchases.length,
        totalValue: totalRevenue * 100 // Convert to cents
      };

      // Process recent transformations data and get user emails
      const recentTransformationsWithEmails = await Promise.all(
        (recentResult.data || []).map(async (transformation) => {
          // Get user email from the user_id (simplified approach)
          const userId = transformation.user_id;
          const userEmail = `user${userId.substring(0, 8)}@exemplo.com`; // Placeholder email
          
          return {
            ...transformation,
            user_email: userEmail
          };
        })
      );

      console.log('Dashboard data prepared, setting state');
      setDashboardData({
        newSignups,
        totalTransformations,
        plansContracted,
        totalRevenue,
        reprocessingRate,
        previousPeriod: {
          newSignups: comparisonSignups,
          totalTransformations: comparisonTransformationsCount,
          plansContracted: comparisonPlansContracted,
          totalRevenue: comparisonRevenue,
          reprocessingRate: comparisonReprocessingRate
        },
        popularStyles,
        recentTransformations: recentTransformationsWithEmails,
        paymentStats,
        usageByDay,
        revenueByDay,
        conversionFunnel
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  console.log('AdminDashboard render - loading:', loading, 'roleLoading:', roleLoading, 'isLoading:', isLoading, 'user:', !!user, 'isAdmin:', isAdmin, 'dashboardData:', !!dashboardData);

  if (loading || roleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
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

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <Card className="text-center mb-6">
            <CardContent className="pt-6">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground mb-4">
                {!user ? 
                  "Você precisa estar logado para acessar o dashboard administrativo." :
                  "Você precisa de permissões de administrador para acessar esta página."
                }
              </p>
              {!user && (
                <p className="text-sm text-muted-foreground">
                  Entre na sua conta para continuar.
                </p>
              )}
              {user && !isAdmin && (
                <p className="text-sm text-muted-foreground">
                  Entre em contato com um administrador para obter acesso.
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Show Make Admin button if user is logged but not admin */}
          {user && !isAdmin && <MakeAdminButton />}
        </div>
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
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </div>

        {/* Metrics Cards */}
        {dashboardData ? (
          <MetricsCards data={dashboardData} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
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
              <RevenueCharts data={dashboardData.revenueByDay} />
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

        {/* Popular Styles */}
        {dashboardData ? (
          <PopularStyles styles={dashboardData.popularStyles} />
        ) : (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        )}

        {/* Conversion Funnel and Recent Transformations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dashboardData ? (
            <>
              <ConversionFunnel data={dashboardData.conversionFunnel} />
              <RecentTransformations transformations={dashboardData.recentTransformations} />
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

        {/* User Photo Viewer */}
        {dashboardData ? (
          <UserPhotoViewer />
        ) : (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;