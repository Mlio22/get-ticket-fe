import { ThemeToggle } from "@/components/ThemeToggle";
import { APP_NAME, PUBLIC_ROUTES } from "@/constants";
import { Ticket } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal top bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <Link href={PUBLIC_ROUTES.HOME} className="flex items-center gap-2 font-bold text-primary">
            <Ticket className="h-5 w-5" />
            <span>{APP_NAME}</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Centered card */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
