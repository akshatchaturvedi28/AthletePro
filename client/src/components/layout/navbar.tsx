import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { 
  Dumbbell, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { 
    user, 
    admin, 
    isAuthenticated, 
    accountType, 
    hasLinkedAccount, 
    linkedAccountRole,
    transitionToAdmin,
    transitionToUser,
    logout 
  } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleLogin = () => {
    navigate('/signin');
  };

  const navigationItems = [
    { name: 'Features', href: '#features' },
    { name: 'Workouts', href: '#workouts' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      // Handle anchor links by scrolling to section
      // First check if we're on the landing page
      if (window.location.pathname !== '/') {
        // Navigate to landing page first, then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // Already on landing page, just scroll
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      // Handle regular navigation
      navigate(href);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Dumbbell className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold text-secondary">ACrossFit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.name}
                  </button>
                ))}
              </>
            ) : (
              <>
                {/* User Console Navigation */}
                {accountType === 'user' && (
                  <>
                    <Link
                      href="/athlete/dashboard"
                      className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/athlete/calendar"
                      className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Calendar
                    </Link>
                    <Link
                      href="/athlete/progress"
                      className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Progress
                    </Link>
                  </>
                )}
                
                {/* Admin Console Navigation */}
                {accountType === 'admin' && (
                  <>
                    <Link
                      href="/admin/console"
                      className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Admin Console
                    </Link>
                    <Link
                      href="/admin/manage-community"
                      className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Community
                    </Link>
                    <Link
                      href="/admin/leaderboard" 
                      className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Leaderboard
                    </Link>
                  </>
                )}
                
                <Link
                  href="/"
                  className="text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleLogin}
                  className="text-gray-600 hover:text-primary"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => window.location.href = '/signup'}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Sign Up FREE
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                      <AvatarFallback>
                        {user?.firstName?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {accountType === 'user' 
                          ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email
                          : `${admin?.firstName || ''} ${admin?.lastName || ''}`.trim() || admin?.email
                        }
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {accountType === 'user' ? user?.email : admin?.email}
                      </p>
                      <p className="text-xs text-blue-600 capitalize">
                        {accountType === 'user' ? 'Athlete Mode' : `${admin?.role || 'Admin'} Mode`}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  
                  <DropdownMenuItem onClick={() => navigate(accountType === 'user' ? '/athlete/account' : '/admin/admin-account')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
                    try {
                      await logout();
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout error:', error);
                      window.location.href = '/';
                    }
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {!isAuthenticated ? (
                <>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {/* User Console Mobile Navigation */}
                  {accountType === 'user' && (
                    <>
                      <Link
                        href="/athlete/dashboard"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/athlete/calendar"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Calendar
                      </Link>
                      <Link
                        href="/athlete/progress"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Progress
                      </Link>
                    </>
                  )}
                  
                  {/* Admin Console Mobile Navigation */}
                  {accountType === 'admin' && (
                    <>
                      <Link
                        href="/admin/console"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Console
                      </Link>
                      <Link
                        href="/admin/manage-community"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Community
                      </Link>
                      <Link
                        href="/admin/leaderboard"
                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Leaderboard
                      </Link>
                    </>
                  )}
                  
                  <Link
                    href="/"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
