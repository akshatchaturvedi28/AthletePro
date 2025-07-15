import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
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
  UserCog
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const isAthlete = !user?.membership || user?.membership?.role === "athlete";
  const isCoach = user?.membership?.role === "coach" || user?.membership?.role === "manager";

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
    <div className={cn("flex flex-col w-64 bg-white border-r border-gray-200", className)}>
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
        <div className="flex items-center space-x-3">
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
              {user?.membership?.role || "Athlete"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
