import { Switch, Route } from "wouter";
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
  const { isAuthenticated, isLoading, user, needsRegistration } = useAuth();

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

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/community" component={CommunityLanding} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/feedback" component={Feedback} />
          
          {/* Authentication Routes */}
          <Route path="/signin" component={UserSignIn} />
          <Route path="/signup" component={UserSignUp} />
          <Route path="/admin/signin" component={AdminSignIn} />
          <Route path="/admin/signup" component={AdminSignUp} />
          <Route path="/admin" component={AdminSignIn} />
          <Route path="/admin/console" component={AdminConsole} />
          <Route path="/admin/coach" component={CoachDashboard} />
          <Route path="/admin/account" component={AdminAccount} />
          <Route path="/admin/manage-community" component={ManageCommunity} />
          <Route path="/forgot-password" component={() => <ForgotPassword userType="user" />} />
          <Route path="/admin/forgot-password" component={() => <ForgotPassword userType="admin" />} />
          <Route path="/admin/create-community" component={CreateCommunity} />
        </>
      ) : (
        <>
          {/* Check user role and redirect accordingly */}
          {(user as any)?.membership?.role === "manager" || (user as any)?.membership?.role === "coach" ? (
            <>
              <Route path="/" component={CoachDashboard} />
              <Route path="/dashboard" component={CoachDashboard} />
              <Route path="/community" component={CoachCommunity} />
              <Route path="/leaderboard" component={CoachLeaderboard} />
              <Route path="/admin" component={AdminConsole} />
              <Route path="/admin/manage-community" component={ManageCommunity} />
              <Route path="/admin/coach" component={CoachDashboard} />
              <Route path="/admin/account" component={AdminAccount} />
              <Route path="/profile" component={AthleteProfile} />
              <Route path="/progress" component={AthleteProgress} />
              <Route path="/account" component={AthleteAccount} />
            </>
          ) : (
            <>
              <Route path="/" component={AthleteDashboard} />
              <Route path="/dashboard" component={AthleteDashboard} />
              <Route path="/calendar" component={AthleteCalendar} />
              <Route path="/profile" component={AthleteProfile} />
              <Route path="/progress" component={AthleteProgress} />
              <Route path="/account" component={AthleteAccount} />
              <Route path="/athlete/:id">
            {(params) => <PublicProfile athleteId={params.id} />}
          </Route>
            </>
          )}
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
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
