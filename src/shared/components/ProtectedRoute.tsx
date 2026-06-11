import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRole, type AppRole } from '@/shared/hooks/useRole';
import { useSubscription, type PlanId } from '@/shared/hooks/useSubscription';

interface ProtectedRouteProps {
  allowedRoles?: AppRole[];
  requiredPlan?: PlanId;
  requireSubscription?: boolean;
}

/**
 * Protects routes from unauthenticated access.
 * Optionally checks role and subscription tier.
 * Redirects to /auth if not logged in.
 * Redirects to /pricing if subscription required but not met.
 * Redirects to /dashboard if role doesn't match.
 * 
 * NOTE: If role is unknown (null), access is allowed to prevent lockouts.
 * The page itself should handle role-specific UI.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPlan,
  requireSubscription = false,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isTherapist, isParent, isExplorer } = useRole();
  const { subscription, loading: subLoading, canAccessFeature } = useSubscription();
  const location = useLocation();

  // Fallback: check localStorage role if database role is not found
  const localRole = typeof window !== 'undefined' ? localStorage.getItem('speakable_role') : null;
  const effectiveRole = role || (localRole === 'professional' ? 'therapist' : localRole === 'student' ? 'explorer' : localRole === 'parent' ? 'parent' : null);
  const effectiveIsTherapist = isTherapist || effectiveRole === 'therapist';
  const effectiveIsParent = isParent || effectiveRole === 'parent';
  const effectiveIsExplorer = isExplorer || effectiveRole === 'explorer';

  if (authLoading || roleLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse mx-auto" />
          <p className="text-sm font-medium text-slate-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access (only if we KNOW the user's role)
  if (allowedRoles && allowedRoles.length > 0 && effectiveRole) {
    const hasAccess = allowedRoles.some((r) => {
      if (r === 'therapist') return effectiveIsTherapist;
      if (r === 'parent') return effectiveIsParent;
      if (r === 'explorer') return effectiveIsExplorer;
      return effectiveRole === r;
    });

    if (!hasAccess) {
      // Redirect based on user's actual role
      if (effectiveIsTherapist) return <Navigate to="/therapist-portal" replace />;
      if (effectiveIsParent) return <Navigate to="/parent-dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check subscription-based access
  if (requireSubscription && requiredPlan) {
    if (!canAccessFeature(requiredPlan)) {
      return <Navigate to="/pricing" state={{ from: location, requiredPlan }} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
