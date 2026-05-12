import { EventCard } from "@/components/EventCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_NAME, DEFAULT_PAGE_SIZE, EVENT_CATEGORIES, PUBLIC_ROUTES } from "@/constants";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuthStore } from "@/stores/authStore";
import { useEventStore } from "@/stores/eventStore";
import type { EventCategory } from "@/types";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function EventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const { events, isLoading, error, total, page, totalPages, fetchEvents } = useEventStore();

  const [search, setSearch] = useState((router.query.search as string) ?? "");
  const [activeCategory, setActiveCategory] = useState((router.query.category as string) ?? "");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const validCategories = new Set<string>(EVENT_CATEGORIES.map((c) => c.value));

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated && user?.role === "organizer") {
      router.replace("/organizer/events");
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // Sync filters from URL on mount and when query changes
  useEffect(() => {
    const rawCategory = (router.query.category as string) ?? "";
    const category = validCategories.has(rawCategory) ? (rawCategory as EventCategory) : undefined;
    const searchQ = (router.query.search as string) ?? "";
    const pageQ = Number(router.query.page) || 1;

    setActiveCategory(category ?? "");
    setSearch(searchQ);

    fetchEvents({
      page: pageQ,
      limit: DEFAULT_PAGE_SIZE,
      ...(category ? { category } : {}),
      ...(searchQ ? { search: searchQ } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.category, router.query.search, router.query.page]);

  const updateQuery = (updates: Record<string, string | number | undefined>) => {
    const merged = {
      ...router.query,
      page: 1,
      ...updates,
    };
    // Remove empty values
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== null) {
        cleaned[k] = String(v);
      }
    }
    router.push({ pathname: PUBLIC_ROUTES.EVENTS, query: cleaned }, undefined, { shallow: true });
  };

  const handleCategoryClick = (cat: string) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCategory(next);
    updateQuery({ category: next || undefined });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      updateQuery({ search: value || undefined });
    }, 400);
  };

  const handleClearSearch = () => {
    setSearch("");
    updateQuery({ search: undefined });
  };

  const handlePageChange = (newPage: number) => {
    updateQuery({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout>
      <Head>
        <title>Browse Events – {APP_NAME}</title>
        <meta
          name="description"
          content="Discover concerts, sports, tech conferences, food festivals, and more."
        />
      </Head>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Browse Events</h1>
          <p className="text-muted-foreground mt-1">
            {total > 0 ? `${total} event${total !== 1 ? "s" : ""} found` : "Discover events near you"}
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search events…"
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={activeCategory === "" ? "default" : "outline"}
            className="cursor-pointer px-3 py-1 text-sm"
            onClick={() => handleCategoryClick("")}
          >
            All
          </Badge>
          {EVENT_CATEGORIES.map((cat) => (
            <Badge
              key={cat.value}
              variant={activeCategory === cat.value ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm"
              onClick={() => handleCategoryClick(cat.value)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        {/* Events grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-24 text-destructive">
            <p className="font-medium">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchEvents({ page: 1, limit: DEFAULT_PAGE_SIZE })}
            >
                Try again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="font-medium text-lg">No events found</p>
              <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("");
                  router.push(PUBLIC_ROUTES.EVENTS);
                }}
              >
                Clear filters
              </Button>
            </div>
            ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
                </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
