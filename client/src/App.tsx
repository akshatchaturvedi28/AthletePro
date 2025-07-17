import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Registration from "@/pages/registration";
import AthleteDashboard from "@/pages/athlete/dashboard";
import AthleteCalendar from "@/pages/athlete/calendar";
import AthleteProfile from "@/pages/athlete/profile";
import AthleteProgress from "@/pages/athlete/progress";
import CoachDashboard from "@/pages/coach/dashboard";
import CoachCommunity from "@/pages/coach/community";
import CoachLeaderboard from "@/pages/coach/leaderboard";
import AdminConsole from "@/pages/admin/console";
import CommunityLanding from "@/pages/community-landing";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";

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
              <Route path="/profile" component={AthleteProfile} />
              <Route path="/progress" component={AthleteProgress} />
            </>
          ) : (
            <>
              <Route path="/" component={AthleteDashboard} />
              <Route path="/dashboard" component={AthleteDashboard} />
              <Route path="/calendar" component={AthleteCalendar} />
              <Route path="/profile" component={AthleteProfile} />
              <Route path="/progress" component={AthleteProgress} />
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
