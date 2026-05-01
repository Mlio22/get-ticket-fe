import { EventCard } from "@/components/EventCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_NAME, DEFAULT_PAGE_SIZE, EVENT_CATEGORIES } from "@/constants";
import { MainLayout } from "@/layouts/MainLayout";
import { useEventStore } from "@/stores/eventStore";
import type { EventCategory } from "@/types";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EventsPage() {
  const router = useRouter();
  const { events, total, totalPages, page, isLoading, fetchEvents } =
    useEventStore();

  const [search, setSearch] = useState((router.query.search as string) || "");
  const selectedCategory = router.query.category as EventCategory | undefined;

  // Fetch events from the real API when filters/query change
  useEffect(() => {
    fetchEvents({
      search: (router.query.search as string) || undefined,
      category: router.query.category as EventCategory | undefined,
      page: router.query.page ? Number(router.query.page) : 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  const updateQuery = (params: Record<string, string | number | undefined>) => {
    const query = { ...router.query, ...params };
    // Remove undefined keys
    Object.keys(query).forEach((k) => query[k] === undefined && delete query[k]);
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: search || undefined, page: 1 });
  };

  const handleCategorySelect = (cat: EventCategory | undefined) => {
    updateQuery({ category: cat, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateQuery({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearch("");
    router.push({ pathname: router.pathname }, undefined, { shallow: true });
  };

  const hasActiveFilters = !!router.query.search || !!router.query.category;

  return (
    <MainLayout>
      <Head>
        <title>Events – {APP_NAME}</title>
        <meta name="description" content="Browse all available events." />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Events</h1>
          <p className="text-muted-foreground">
            {total > 0 ? `${total.toLocaleString()} events found` : "Discover upcoming events"}
          </p>
        </div>

        {/* Search + filters */}
        <div className="space-y-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => handleCategorySelect(undefined)}
              className={`rounded-full px-3 py-1 text-sm border transition-colors ${!selectedCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent"
                }`}
            >
              All
            </button>
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value as EventCategory)}
                className={`rounded-full px-3 py-1 text-sm border transition-colors ${selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-accent"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex gap-2 flex-wrap">
              {router.query.search && (
                <Badge variant="secondary">
                  Search: "{router.query.search}"
                  <button
                    onClick={() => updateQuery({ search: undefined, page: 1 })}
                    className="ml-1.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary">
                  {EVENT_CATEGORIES.find((c) => c.value === selectedCategory)?.label}
                  <button
                    onClick={() => handleCategorySelect(undefined)}
                    className="ml-1.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
              <div key={i} className="h-72 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No events found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
            {hasActiveFilters && (
              <Button variant="link" className="mt-2" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
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
