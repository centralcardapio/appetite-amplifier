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
import { PopularPlans } from "@/components/dashboard/PopularPlans";
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
  popularPlans: Array<{ plan: string; count: number }>;
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
  
  // Default to last 7 days
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());

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
  }, [user, loading, isAdmin, roleLoading, startDate, endDate]);

  const fetchDashboardData = async () => {
    console.log('Starting fetchDashboardData');
    if (!startDate || !endDate) return;
    
    try {
      setIsLoading(true);

      const startDateFormatted = startOfDay(startDate);
      const endDateFormatted = endOfDay(endDate);
      const daysDiff = Math.ceil((endDateFormatted.getTime() - startDateFormatted.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate comparison period
      const comparisonEndDate = subDays(startDateFormatted, 1);
      const comparisonStartDate = subDays(comparisonEndDate, daysDiff - 1);

      // Fetch all data in parallel
      const [
        authUsersResult,
        creditUsageResult,
        paymentsResult,
        stylesResult,
        recentResult,
        photoTransformationsResult,
        // Comparison period data
        comparisonAuthUsersResult,
        comparisonCreditUsageResult,
        comparisonPaymentsResult,
        comparisonPhotoTransformationsResult
      ] = await Promise.all([
        // Current period - auth users (new signups)
        supabase.auth.admin.listUsers(),
        
        // Current period - credit usage (transformations)
        supabase
          .from('credit_usage_history')
          .select('amount_used, used_at')
          .gte('used_at', startDateFormatted.toISOString())
          .lte('used_at', endDateFormatted.toISOString()),
        
        // Current period - payments
        supabase
          .from('payments')
          .select('id, value, created_at, status, plan_name')
          .eq('status', 'CONFIRMED')
          .eq('billing_type', 'CREDIT_CARD')
          .gte('created_at', startDateFormatted.toISOString())
          .lte('created_at', endDateFormatted.toISOString()),
        
        // Popular styles from users created in period
        supabase
          .from('user_styles')
          .select('selected_style, user_id'),
        
        // Recent transformations (last 10)
        supabase
          .from('photo_transformations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),

        // Current period - photo transformations (for reprocessing rate)
        supabase
          .from('photo_transformations')
          .select('id, reprocessing_count, created_at')
          .gte('created_at', startDateFormatted.toISOString())
          .lte('created_at', endDateFormatted.toISOString()),

        // Comparison period - auth users
        supabase.auth.admin.listUsers(),

        // Comparison period - credit usage
        supabase
          .from('credit_usage_history')
          .select('amount_used, used_at')
          .gte('used_at', comparisonStartDate.toISOString())
          .lte('used_at', comparisonEndDate.toISOString()),

        // Comparison period - payments
        supabase
          .from('payments')
          .select('id, value, created_at, status')
          .eq('status', 'CONFIRMED')
          .eq('billing_type', 'CREDIT_CARD')
          .gte('created_at', comparisonStartDate.toISOString())
          .lte('created_at', comparisonEndDate.toISOString()),

        // Comparison period - photo transformations (for reprocessing rate)
        supabase
          .from('photo_transformations')
          .select('id, reprocessing_count, created_at')
          .gte('created_at', comparisonStartDate.toISOString())
          .lte('created_at', comparisonEndDate.toISOString())
      ]);

      console.log('Data fetched:', {
        authUsers: authUsersResult.data?.users?.length,
        creditUsage: creditUsageResult.data?.length,
        payments: paymentsResult.data?.length,
        styles: stylesResult.data?.length
      });

      // Filter auth users by creation date for current period
      const currentUsers = (authUsersResult.data?.users || []).filter(user => {
        const createdAt = new Date(user.created_at);
        return createdAt >= startDateFormatted && createdAt <= endDateFormatted;
      });

      // Filter auth users by creation date for comparison period
      const comparisonUsers = (comparisonAuthUsersResult.data?.users || []).filter(user => {
        const createdAt = new Date(user.created_at);
        return createdAt >= comparisonStartDate && createdAt <= comparisonEndDate;
      });

      // Process current period data
      const currentCreditUsage = creditUsageResult.data || [];
      const currentPayments = paymentsResult.data || [];
      const currentPhotoTransformations = photoTransformationsResult.data || [];
      
      // Process comparison period data
      const comparisonCreditUsage = comparisonCreditUsageResult.data || [];
      const comparisonPayments = comparisonPaymentsResult.data || [];
      const comparisonPhotoTransformations = comparisonPhotoTransformationsResult.data || [];

      // Calculate metrics
      const newSignups = currentUsers.length;
      const totalTransformations = currentCreditUsage.reduce((sum, record) => sum + record.amount_used, 0);
      const plansContracted = currentPayments.length;
      const totalRevenue = currentPayments.reduce((sum, payment) => sum + payment.value, 0);
      
      // Calculate reprocessing rate
      const totalTransformationsForRate = currentPhotoTransformations.length;
      const reprocessedTransformations = currentPhotoTransformations.filter(t => t.reprocessing_count > 0).length;
      const reprocessingRate = totalTransformationsForRate > 0 ? (reprocessedTransformations / totalTransformationsForRate) * 100 : 0;

      // Calculate comparison metrics
      const comparisonSignups = comparisonUsers.length;
      const comparisonTransformationsCount = comparisonCreditUsage.reduce((sum, record) => sum + record.amount_used, 0);
      const comparisonPlansContracted = comparisonPayments.length;
      const comparisonRevenue = comparisonPayments.reduce((sum, payment) => sum + payment.value, 0);
      const comparisonTotalTransformations = comparisonPhotoTransformations.length;
      const comparisonReprocessed = comparisonPhotoTransformations.filter(t => t.reprocessing_count > 0).length;
      const comparisonReprocessingRate = comparisonTotalTransformations > 0 ? (comparisonReprocessed / comparisonTotalTransformations) * 100 : 0;

      // Process popular styles from users created in period
      const styles = stylesResult.data || [];
      const currentUserIds = currentUsers.map(u => u.id);
      const stylesFromPeriod = styles.filter(style => currentUserIds.includes(style.user_id));
      
      const styleCount = stylesFromPeriod.reduce((acc, style) => {
        acc[style.selected_style] = (acc[style.selected_style] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const popularStyles = Object.entries(styleCount)
        .map(([style, count]) => ({ style, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Process popular plans
      const planCount = currentPayments.reduce((acc, payment) => {
        const planName = payment.plan_name || 'Plano Básico';
        acc[planName] = (acc[planName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const popularPlans = Object.entries(planCount)
        .map(([plan, count]) => ({ plan, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Generate usage by day
      const usageByDay = [];
      const revenueByDay = [];
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDateFormatted);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayTransformations = currentCreditUsage.filter(record => 
          record.used_at.startsWith(dateStr)
        ).reduce((sum, record) => sum + record.amount_used, 0);

        const daySignups = currentUsers.filter((u: any) => 
          u.created_at.startsWith(dateStr)
        ).length;

        const dayPlans = currentPayments.filter(p => 
          p.created_at.startsWith(dateStr)
        ).length;

        const dayRevenue = currentPayments.filter(p => 
          p.created_at.startsWith(dateStr)
        ).reduce((sum, payment) => sum + payment.value, 0);

        const dayTransformationsForRate = currentPhotoTransformations.filter(t => 
          t.created_at.startsWith(dateStr)
        );
        const dayReprocessed = dayTransformationsForRate.filter(t => t.reprocessing_count > 0).length;
        const dayReprocessingRate = dayTransformationsForRate.length > 0 ? (dayReprocessed / dayTransformationsForRate.length) * 100 : 0;

        usageByDay.push({
          date: dateStr,
          transformations: dayTransformations,
          newSignups: daySignups,
          reprocessingRate: dayReprocessingRate
        });

        revenueByDay.push({
          date: dateStr,
          plans: dayPlans,
          revenue: dayRevenue
        });
      }

      // Get conversion funnel data
      const signupUserIds = currentUsers.map((u: any) => u.id);

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
          .from('payments')
          .select('user_id')
          .in('user_id', signupUserIds)
          .eq('status', 'CONFIRMED')
          .eq('billing_type', 'CREDIT_CARD')
      ]);

      const usersWithLastSignIn = currentUsers.filter((u: any) => u.last_sign_in_at).length;

      const conversionFunnel = {
        totalSignups: signupUserIds.length,
        emailConfirmed: usersWithLastSignIn,
        styleSelected: [...new Set(stylesInPeriod.data?.map(s => s.user_id) || [])].length,
        tested: [...new Set(transformationsAllTime.data?.map(t => t.user_id) || [])].length,
        purchasedCredits: [...new Set(purchasesAllTime.data?.map(p => p.user_id) || [])].length
      };

      const paymentStats = {
        pending: 0,
        confirmed: plansContracted,
        totalValue: totalRevenue
      };

      // Process recent transformations data and get user emails
      const recentTransformationsWithEmails = await Promise.all(
        (recentResult.data || []).map(async (transformation) => {
          // Get user email from auth users
          const authUser = authUsersResult.data?.users?.find((u: any) => u.id === transformation.user_id);
          const userEmail = authUser?.email || 'N/A';
          
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
        popularPlans,
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
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground mb-1">Data Inicial</label>
              <DateRangePicker 
                selectedDate={startDate}
                onDateChange={setStartDate}
                placeholder="Data inicial"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground mb-1">Data Final</label>
              <DateRangePicker 
                selectedDate={endDate}
                onDateChange={setEndDate}
                placeholder="Data final"
              />
            </div>
          </div>
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

        {/* Popular Styles and Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dashboardData ? (
            <>
              <PopularStyles styles={dashboardData.popularStyles} />
              <PopularPlans plans={dashboardData.popularPlans} />
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
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
                  <Skeleton className="h-6 w-40" />
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
              <Skeleton className="h-6 w-32" />
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