import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type AppRole = 'admin' | 'counselor' | 'student';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  // Still determining auth state — show spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in — go to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Logged in but role not assigned — go back to auth page (shows "Role Not Assigned" message)
  if (!userRole) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in with a role, but wrong role for this route — redirect to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const dashboardPath = userRole === 'admin' ? '/admin' :
      userRole === 'counselor' ? '/counselor' :
        '/student';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}