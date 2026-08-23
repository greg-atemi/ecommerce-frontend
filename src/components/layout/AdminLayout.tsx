import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin",             label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { to: "/admin/orders",      label: "Orders",     icon: ShoppingCart },
  { to: "/admin/products",    label: "Products",   icon: Package },
  { to: "/admin/users",       label: "Users",      icon: Users },
  { to: "/admin/categories",  label: "Categories", icon: Users },
];

export function AdminLayout() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 shrink-0 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">{user?.name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === to
              : pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            ← Back to store
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2.5 text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}