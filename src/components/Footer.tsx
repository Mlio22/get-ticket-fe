import { APP_NAME, PUBLIC_ROUTES } from "@/constants";
import { Ticket } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-primary text-lg mb-3">
              <Ticket className="h-5 w-5" />
              <span>{APP_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Discover and buy tickets for the best events near you. Sports, concerts, tech
              conferences, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={PUBLIC_ROUTES.EVENTS} className="hover:text-primary transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link
                  href={`${PUBLIC_ROUTES.EVENTS}?category=music`}
                  className="hover:text-primary transition-colors"
                >
                  Music
                </Link>
              </li>
              <li>
                <Link
                  href={`${PUBLIC_ROUTES.EVENTS}?category=sports`}
                  className="hover:text-primary transition-colors"
                >
                  Sports
                </Link>
              </li>
              <li>
                <Link
                  href={`${PUBLIC_ROUTES.EVENTS}?category=technology`}
                  className="hover:text-primary transition-colors"
                >
                  Technology
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={PUBLIC_ROUTES.LOGIN} className="hover:text-primary transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  href={PUBLIC_ROUTES.REGISTER}
                  className="hover:text-primary transition-colors"
                >
                  Sign up
                </Link>
              </li>
              <li>
                <Link
                  href={`${PUBLIC_ROUTES.REGISTER}?role=organizer`}
                  className="hover:text-primary transition-colors"
                >
                  Become an Organizer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
