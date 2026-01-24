import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  BarChart3, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Calendar,
  ClipboardList,
  AlertTriangle,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: ReactNode;
}

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
};

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="h-5 w-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'User Management', href: '/admin/users', icon: <UserCircle className="h-5 w-5" /> },
  { label: 'Reports', href: '/admin/reports', icon: <FileText className="h-5 w-5" /> },
];

const counselorNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/counselor', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'At-Risk Students', href: '/counselor/at-risk', icon: <AlertTriangle className="h-5 w-5" /> },
  { label: 'Sessions', href: '/counselor/sessions', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Recommendations', href: '/counselor/recommendations', icon: <ClipboardList className="h-5 w-5" /> },
];

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Academic Data', href: '/student/academics', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Counseling', href: '/student/counseling', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Survey', href: '/student/survey', icon: <ClipboardList className="h-5 w-5" /> },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = userRole === 'admin' ? adminNavItems :
                   userRole === 'counselor' ? counselorNavItems :
                   studentNavItems;

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U';

  const roleLabel = userRole === 'admin' ? 'Administrator' :
                    userRole === 'counselor' ? 'Counselor' :
                    'Student';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 bg-sidebar-primary/20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-sidebar-primary" />
              </div>
              <div>
                <span className="font-display font-bold text-sidebar-foreground">EduPredict</span>
                <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
              </div>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-risk-high text-risk-high-foreground text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-sidebar-primary/30">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-display font-semibold text-foreground">
              {navItems.find(item => item.href === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-risk-high rounded-full" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.user_metadata?.full_name || 'User'}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}