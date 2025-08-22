import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  LogOut,
  ChevronDown,
  ArrowLeftRight
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { 
    user, 
    admin, 
    logout, 
    accountType, 
    hasLinkedAccount, 
    linkedAccountRole,
    transitionToAdmin,
    transitionToUser 
  } = useAuth();
  const [location] = useLocation();

  // User Console Navigation (Athletes)
  const userNavigation = [
    {
      name: "Dashboard",
      href: "/athlete/dashboard",
      icon: BarChart3,
      current: location === "/athlete/dashboard" || location === "/" || location === "/dashboard"
    },
    {
      name: "Calendar",
      href: "/athlete/calendar",
      icon: Calendar,
      current: location === "/athlete/calendar" || location === "/calendar"
    },
    {
      name: "Progress",
      href: "/athlete/progress",
      icon: TrendingUp,
      current: location === "/athlete/progress" || location === "/progress"
    },
    {
      name: "Profile",
      href: "/athlete/profile",
      icon: User,
      current: location === "/athlete/profile" || location === "/profile"
    }
  ];

  // Admin Console Navigation
  const adminNavigation = [
    {
      name: "Admin Console",
      href: "/admin/console",
      icon: BarChart3,
      current: location === "/admin/console" || location === "/"
    },
    {
      name: "Community",
      href: "/admin/manage-community",
      icon: Users,
      current: location === "/admin/manage-community"
    },
    {
      name: "Leaderboard",
      href: "/admin/leaderboard",
      icon: Trophy,
      current: location === "/admin/leaderboard"
    },
    {
      name: "Profile",
      href: "/admin/admin-account",
      icon: User,
      current: location === "/admin/admin-account"
    }
  ];

  // Determine navigation based on account type
  const navigation = accountType === 'admin' ? adminNavigation : userNavigation;
  const currentUser = accountType === 'admin' ? admin : user;
  const currentMode = accountType === 'admin' ? 
    (admin?.role === 'community_manager' ? 'Manager Mode' : 'Coach Mode') : 
    'Athlete Mode';

  const handleAccountTransition = async () => {
    try {
      if (accountType === 'user' && hasLinkedAccount) {
        await transitionToAdmin();
      } else if (accountType === 'admin' && hasLinkedAccount) {
        await transitionToUser();
      }
    } catch (error) {
      console.error('Account transition failed:', error);
    }
  };

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
                {currentUser?.firstName?.[0] || currentUser?.email?.[0] || "U"}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentMode}
            </p>
          </div>
        </div>

        {/* Account Switching */}
        {hasLinkedAccount && (
          <div className="mb-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-primary hover:bg-primary/10 border-primary/20"
              onClick={handleAccountTransition}
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Switch to {accountType === 'user' ? 
                (linkedAccountRole === 'community_manager' ? 'Manager' : 'Coach') : 
                'Athlete'} Mode
            </Button>
          </div>
        )}
        
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
