"use client";
import "@blog/i18n/boot";

import { useQueryState, parseAsString, parseAsInteger, parseAsArrayOf } from "nuqs";
import { Container } from "@blog/components/container";
import { CourseCard } from "@blog/components/course";
import { PaginationNuqs } from "@blog/components/pagination/pagination-nuqs";
import { CoursesHeader } from "./CoursesHeader";
import { CoursesSearch } from "./CoursesSearch";
import { FilterModal } from "./FilterModal";
import { api } from "@blog/trpc/react";
import { useTranslation } from "react-i18next";
import { useIntersection } from "@mantine/hooks";

interface Course {
  slug: string;
  title: string;
  description?: string;
  lang?: string;
  previews: Record<string, any>;
  tags?: string[];
  authors?: string;
  domain?: string;
  date?: string;
  author?: string;
  readingTime?: number;
  domain?: string;
}

interface CoursesClientProps {
  courses: Course[];
}

export function CoursesClient({ courses }: CoursesClientProps) {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [domains, setDomains] = useQueryState("domains", parseAsArrayOf(parseAsString).withDefault([]));
  const [authors, setAuthors] = useQueryState("authors", parseAsArrayOf(parseAsString).withDefault([]));
  const [tags, setTags] = useQueryState("tags", parseAsArrayOf(parseAsString).withDefault([]));

  const perPage = 8;

  // Filter courses based on language, domains, authors, and tags
  const filtered = useMemo(() => {
    if (hasActiveFilters) return []; // Don't use this when filters are active

    return courses.filter((c) => {
      // Language filter
      if (lang === "fr") {
        if ((c.lang ?? "").toLowerCase() !== "fr") return false;
      } else {
        // Default 'en': include english or missing lang
        if ((c.lang?.toLowerCase() ?? "en") !== "en") return false;
      }

      // Domain filter
      if (domains.length > 0) {
        if (!c.domain || !domains.includes(c.domain)) return false;
      }

      // Authors filter
      if (authors.length > 0) {
        if (!c.authors || !authors.includes(c.authors)) return false;
      }

      // Tags filter (course must have at least one of the selected tags)
      if (tags.length > 0) {
        if (!c.tags || !c.tags.some(tag => tags.includes(tag))) return false;
      }

      return true;
    });
  }, [courses, lang, domains, authors, tags]);

  const total = hasActiveFilters
    ? (filteredData?.pages[0]?.total ?? 0)
    : filtered.length;

  // Pagination for regular browsing
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * perPage;
  const pageItems = hasActiveFilters ? displayData : filtered.slice(start, start + perPage);

  // Generate current URL for returnTo parameter
  const currentListUrl = `/courses${current > 1 ? `?page=${current}` : ""}`;

  return (
    <div className="bg-black">
      <Container>
        <div className="mb-6 space-y-4">
          <CoursesHeader total={total} />
        </div>
        <CoursesSearch
          onFiltersChange={(filters) => {
            setDomains(filters.domains);
            setAuthors(filters.authors);
            setTags(filters.tags);
            setPage(1); // Reset to page 1 when filters change
          }}
          activeFilters={{ domains, authors, tags }}
          totalResults={total}
        >
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:gap-8 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.length > 0 ? (
              pageItems.map((item, i) => {
                // Type guard to handle both Course and BlogMeta types
                const courseItem = item as Course;
                const isLast = hasActiveFilters && i === pageItems.length - 1;
                const card = (
                  <CourseCard
                    key={item.slug}
                    slug={item.slug}
                    title={item.title ?? item.slug}
                    description={item.description}
                    lang={item.lang}
                    slide1Html={courseItem.previews ? (courseItem.previews as any)?.firstHtml : undefined}
                    tags={item.tags}
                    date={courseItem.date}
                    author={item.author}
                    readingTime={item.readingTime}
                    returnTo={currentListUrl}
                  />
                );

                return isLast ? (
                  <div key={item.slug} ref={ref}>
                    {card}
                  </div>
                ) : card;
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xl text-gray-400 font-medium">{t("search.noResultsFound")}</p>
                <p className="text-gray-500 mt-2">{t("search.tryAdjustingFilters")}</p>
              </div>
            )}
          </div>

          {/* Show loading indicator for infinite scroll */}
          {hasActiveFilters && isFetchingNextPage && (
            <p className="mt-4 text-center text-sm opacity-70">Loading more...</p>
          )}

          {/* Show pagination only when no filters are active */}
          {!hasActiveFilters && pageCount > 1 && (
            <div className="mt-8 sm:mt-10 flex items-center justify-center">
              <PaginationNuqs
                currentPage={current}
                totalPages={pageCount}
                maxVisiblePages={5}
                onPageChange={setPage}
              />
            </div>
          )}
        </CoursesSearch>
      </Container>
    </div>
  );
}
