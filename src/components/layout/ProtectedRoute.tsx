import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to /login */
  redirectTo?: string;
}

/**
 * Wraps a page that requires authentication.
 * Saves the attempted URL so the user can be redirected back after login.
 *
 * Usage:
 *   <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
 */
export function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
