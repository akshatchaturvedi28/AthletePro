import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Landing & Info Pages
import Landing from "@/pages/landing";
import CommunityLanding from "@/pages/community-landing";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import Privacy from "@/pages/privacy";
import Feedback from "@/pages/feedback";
import NotFound from "@/pages/not-found";

// Authentication Pages
import UserSignIn from "@/pages/auth/user-signin";
import UserSignUp from "@/pages/auth/user-signup";
import AdminSignIn from "@/pages/auth/admin-signin";
import AdminSignUp from "@/pages/auth/admin-signup";
import ForgotPassword from "@/pages/auth/forgot-password";
import OIDCLogin from "@/pages/auth/oidc-login";

// Athlete Pages
import AthleteDashboard from "@/pages/athlete/dashboard";
import AthleteProfile from "@/pages/athlete/profile";
import AthleteProgress from "@/pages/athlete/progress";
import AthleteCalendar from "@/pages/athlete/calendar";
import AthleteAccount from "@/pages/athlete/account";
import PublicProfile from "@/pages/athlete/public-profile";

// Admin Pages
import AdminConsole from "@/pages/admin/console";
import ManageCommunity from "@/pages/admin/manage-community";
import CoachDashboard from "@/pages/admin/coach-dashboard";
import AdminAccount from "@/pages/admin/admin-account";
import CreateCommunity from "@/pages/admin/create-community";

// Legacy
import Registration from "@/pages/registration";
import CoachCommunity from "@/pages/coach/community";
import CoachLeaderboard from "@/pages/coach/leaderboard";

function Router() {
  const { isAuthenticated, isLoading, user, admin, needsRegistration, refresh, accountType } = useAuth();
  const [location, navigate] = useLocation();

  // Check if user just came back from OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authenticated') === 'true') {
      console.log('🔄 OAuth callback detected, refreshing auth...');
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh auth state
      refresh();
    }
  }, [refresh]);

  // Route guards: Redirect users to appropriate console if they end up on wrong routes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (accountType === 'user' && location.startsWith('/admin/')) {
        console.log('🛡️ Route guard: User on admin route, redirecting to athlete dashboard');
        navigate('/athlete/dashboard');
      } else if (accountType === 'admin' && location.startsWith('/athlete/')) {
        console.log('🛡️ Route guard: Admin on athlete route, redirecting to admin console');
        navigate('/admin/console');
      }
    }
  }, [accountType, location, navigate, isAuthenticated, isLoading]);

  // Always show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show registration page if user needs to complete registration
  if (needsRegistration) {
    return <Registration />;
  }

  console.log('🔍 Dual Console Router state:', { 
    isAuthenticated, 
    accountType,
    user: user?.email, 
    admin: admin?.email,
    userRole: user?.role,
    adminRole: admin?.role,
    isLoading, 
    currentPath: window.location.pathname
  });

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          {/* Public Routes */}
          <Route path="/" component={Landing} />
          <Route path="/community" component={CommunityLanding} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/feedback" component={Feedback} />
          
          {/* Authentication Routes */}
          <Route path="/signin" component={UserSignIn} />
          <Route path="/signup" component={UserSignUp} />
          <Route path="/login" component={OIDCLogin} />
          <Route path="/admin/signin" component={AdminSignIn} />
          <Route path="/admin/signup" component={AdminSignUp} />
          <Route path="/admin" component={AdminSignIn} />
          <Route path="/forgot-password" component={() => <ForgotPassword userType="user" />} />
          <Route path="/admin/forgot-password" component={() => <ForgotPassword userType="admin" />} />
        </>
      ) : (
        <>
          {/* Dual Console Routing Based on Account Type */}
          {accountType === 'admin' ? (
            <>
              {/* Admin Console Routes */}
              <Route path="/" component={AdminConsole} />
              <Route path="/admin" component={AdminConsole} />
              <Route path="/admin/console" component={AdminConsole} />
              {/* Community Manager-specific routes */}
              {admin?.role === 'community_manager' && (
                <>
                  <Route path="/admin/manage-community" component={ManageCommunity} />
                  <Route path="/admin/create-community" component={CreateCommunity} />
                </>
              )}

              {/* Shared admin routes */}
              <Route path="/admin/dashboard" component={CoachDashboard} />
              <Route path="/admin/leaderboard" component={CoachLeaderboard} />
              <Route path="/admin/admin-account" component={AdminAccount} />
            </>
          ) : (
            <>
              {/* User Console Routes */}
              <Route path="/" component={AthleteDashboard} />
              <Route path="/athlete" component={AthleteDashboard} />
              <Route path="/athlete/dashboard" component={AthleteDashboard} />
              <Route path="/athlete/calendar" component={AthleteCalendar} />
              <Route path="/athlete/profile" component={AthleteProfile} />
              <Route path="/athlete/progress" component={AthleteProgress} />
              <Route path="/athlete/account" component={AthleteAccount} />
              
              {/* Legacy athlete routes (backward compatibility) */}
              <Route path="/dashboard" component={AthleteDashboard} />
              <Route path="/calendar" component={AthleteCalendar} />
              <Route path="/profile" component={AthleteProfile} />
              <Route path="/progress" component={AthleteProgress} />
              <Route path="/account" component={AthleteAccount} />
              
              {/* Public athlete profile */}
              <Route path="/athlete/:id">
                {(params) => <PublicProfile athleteId={params.id} />}
              </Route>
            </>
          )}

          {/* Shared authenticated routes */}
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/feedback" component={Feedback} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
