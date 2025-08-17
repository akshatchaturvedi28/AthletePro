import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  TrendingUp, 
  User, 
  Users, 
  Trophy, 
  Settings,
  BarChart3,
  Dumbbell,
  Target,
  UserCog,
  LogOut
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isAthlete = (user as any)?.accountType === 'user' || !(user as any)?.membership || (user as any)?.membership?.role === "athlete";
  const isCoach = (user as any)?.accountType === 'admin' || (user as any)?.role === 'coach' || (user as any)?.role === 'community_manager' || (user as any)?.membership?.role === "coach" || (user as any)?.membership?.role === "manager";

  const athleteNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      current: location === "/dashboard" || location === "/"
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
      current: location === "/calendar"
    },
    {
      name: "Progress",
      href: "/progress",
      icon: TrendingUp,
      current: location === "/progress"
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      current: location === "/profile"
    }
  ];

  const coachNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      current: location === "/dashboard" || location === "/"
    },
    {
      name: "Community",
      href: "/community",
      icon: Users,
      current: location === "/community"
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
      current: location === "/leaderboard"
    },
    {
      name: "Progress",
      href: "/progress",
      icon: TrendingUp,
      current: location === "/progress"
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      current: location === "/profile"
    }
  ];

  const navigation = isCoach ? coachNavigation : athleteNavigation;

  return (
    <div className={cn("fixed left-0 top-0 z-40 flex flex-col w-64 h-screen bg-white border-r border-gray-200", className)}>
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Dumbbell className="h-6 w-6 text-primary mr-2" />
        <span className="text-xl font-bold text-secondary">ACrossFit</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.current
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:text-primary hover:bg-gray-50"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || "U"}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {(user as any)?.role || (user as any)?.membership?.role || "Athlete"}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:border-red-200"
          onClick={async () => {
            await logout();
            window.location.href = "/";
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
