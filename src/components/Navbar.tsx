import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_NAME, ORGANIZER_ROUTES, PUBLIC_ROUTES, USER_ROUTES } from "@/constants";
import { PUBLIC_NAV_ROUTES } from "@/routes";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/utils";
import { Calendar, LayoutDashboard, LogOut, Menu, Ticket, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push(PUBLIC_ROUTES.LOGIN);
  };

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  const dashboardHref =
    user?.role === "organizer"
      ? ORGANIZER_ROUTES.DASHBOARD
      : user?.role === "admin"
        ? "/admin"
        : USER_ROUTES.DASHBOARD;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <Ticket className="h-6 w-6" />
          <span>{APP_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {PUBLIC_NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${isActive(route.href)
                  ? "text-primary"
                  : "text-muted-foreground"
                }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground font-normal truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.role === "user" && (
                  <DropdownMenuItem asChild>
                    <Link href={USER_ROUTES.MY_TICKETS} className="cursor-pointer">
                      <Ticket className="mr-2 h-4 w-4" />
                      My Tickets
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "organizer" && (
                  <DropdownMenuItem asChild>
                    <Link href={ORGANIZER_ROUTES.EVENTS} className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      My Events
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={USER_ROUTES.PROFILE} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={PUBLIC_ROUTES.LOGIN}>Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={PUBLIC_ROUTES.REGISTER}>Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 flex flex-col gap-3">
          {PUBLIC_NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm font-medium py-1 ${isActive(route.href) ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {route.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={PUBLIC_ROUTES.LOGIN} onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href={PUBLIC_ROUTES.REGISTER} onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
