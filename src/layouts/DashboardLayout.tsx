import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PUBLIC_ROUTES } from "@/constants";
import { ORGANIZER_NAV_ROUTES, USER_NAV_ROUTES } from "@/routes";
import { useAuthStore } from "@/stores/authStore";
import {
  Calendar,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShoppingBag,
  Ticket,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Ticket: <Ticket className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  PlusCircle: <PlusCircle className="h-4 w-4" />,
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const navRoutes = user?.role === "organizer" ? ORGANIZER_NAV_ROUTES : USER_NAV_ROUTES;

  const handleLogout = async () => {
    await logout();
    router.push(PUBLIC_ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 container mx-auto px-4 py-6 gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-56 flex-col shrink-0">
          <nav className="flex flex-col gap-1">
            {navRoutes.map((route) => {
              const isActive = router.pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  {route.icon ? ICON_MAP[route.icon] : <ChevronRight className="h-4 w-4" />}
                  {route.label}
                </Link>
              );
            })}
          </nav>
          <Separator className="my-4" />
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
