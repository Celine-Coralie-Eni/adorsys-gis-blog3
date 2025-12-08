"use client";
import "@blog/i18n/boot";

import { useMemo, useRef, useEffect } from "react";
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

  const [selectedDomains, setSelectedDomains] = useQueryState(
    "domains",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [selectedAuthors, setSelectedAuthors] = useQueryState(
    "authors",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [selectedTags, setSelectedTags] = useQueryState(
    "tags",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [lang] = useQueryState("lang", parseAsString.withDefault("en"));

  // Fetch filter data
  const { data: allDomains = [] } = api.search.domains.useQuery();
  const { data: allAuthors = [] } = api.search.authors.useQuery();
  const { data: allTags = [] } = api.search.tags.useQuery();

  // Check if any filters are active
  const hasActiveFilters = selectedDomains.length > 0 || selectedAuthors.length > 0 || selectedTags.length > 0;

  // Memoize filter inputs to prevent infinite re-renders
  const filterInput = useMemo(() => ({
    domains: selectedDomains.length > 0 ? selectedDomains : undefined,
    authors: selectedAuthors.length > 0 ? selectedAuthors : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    lang: i18n.language?.startsWith("fr") ? "fr" : "en" as "en" | "fr",
    limit: 10,
  }), [
    // Use JSON.stringify to ensure stability by value, not reference
    JSON.stringify(selectedDomains),
    JSON.stringify(selectedAuthors),
    JSON.stringify(selectedTags),
    i18n.language
  ]);

  // Use infinite scroll when filters are active
  const {
    data: filteredData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching: isFilterFetching
  } = api.post.filtered.useInfiniteQuery(
    filterInput,
    {
      enabled: hasActiveFilters,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Intersection observer for infinite scroll
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (hasActiveFilters && entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasActiveFilters, entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const perPage = 8;

  // For regular browsing (no filters), use client-side filtering with pagination
  const filtered = useMemo(() => {
    if (hasActiveFilters) return []; // Don't use this when filters are active

    return courses.filter((c) => {
      // Language filter - only show courses matching the selected language
      if (c.lang && c.lang !== lang) {
        return false;
      }
      return true;
    });
  }, [courses, lang, hasActiveFilters]);

  // Get the appropriate data based on whether filters are active
  const displayData = hasActiveFilters
    ? filteredData?.pages.flatMap((page) => page.blogs) ?? []
    : filtered;

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
          filterSlot={
            <FilterModal
              domains={allDomains}
              authors={allAuthors}
              tags={allTags}
              selectedDomains={selectedDomains}
              selectedAuthors={selectedAuthors}
              selectedTags={selectedTags}
              onApply={(domains, authors, tags) => {
                setSelectedDomains(domains.length > 0 ? domains : null);
                setSelectedAuthors(authors.length > 0 ? authors : null);
                setSelectedTags(tags.length > 0 ? tags : null);
                setPage(1);
              }}
              filteredBlogsCount={total}
            />
          }
        >
          <div className="w-full">
            {isFilterFetching && !isFetchingNextPage && hasActiveFilters && (
              <div className="text-xs sm:text-sm opacity-70 mb-4">{t("search.searching")}</div>
            )}
          </div>
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
