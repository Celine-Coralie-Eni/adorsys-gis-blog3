"use client";
import "@blog/i18n/boot";

import { useMemo } from "react";
import { useQueryState, parseAsString, parseAsInteger, parseAsArrayOf } from "nuqs";
import { Container } from "@blog/components/container";
import { CourseCard } from "@blog/components/course";
import { PaginationNuqs } from "@blog/components/pagination/pagination-nuqs";
import { CoursesHeader } from "./CoursesHeader";
import { CoursesSearch } from "./CoursesSearch";
import { FilterModal } from "./FilterModal";
import { api } from "@blog/trpc/react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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

  const perPage = 8;

  // Filter courses based on domain, author, tags, and language
  const filtered = useMemo(() => {
    return courses.filter((c) => {
      // Language filter - only show courses matching the selected language
      if (c.lang && c.lang !== lang) {
        return false;
      }

      // Domain filter
      if (selectedDomains.length > 0 && c.domain && !selectedDomains.includes(c.domain)) {
        return false;
      }

      // Author filter
      if (selectedAuthors.length > 0 && c.author && !selectedAuthors.includes(c.author)) {
        return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        if (!c.tags || !c.tags.some(tag => selectedTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }, [courses, selectedDomains, selectedAuthors, selectedTags, lang]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

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
            {/* Filter was here, now moved to search bar */}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:gap-8 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.length > 0 ? (
              pageItems.map(
                ({ slug, title, description, lang, previews, tags, date, author, readingTime }) => (
                  <CourseCard
                    key={slug}
                    slug={slug}
                    title={title}
                    description={description}
                    lang={lang}
                    slide1Html={(previews as any)?.firstHtml}
                    tags={tags}
                    date={date}
                    author={author}
                    readingTime={readingTime}
                    returnTo={currentListUrl}
                  />
                )
              )
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xl text-gray-400 font-medium">{t("search.noResultsFound")}</p>
                <p className="text-gray-500 mt-2">{t("search.tryAdjustingFilters")}</p>
              </div>
            )}
          </div>
          {pageCount > 1 && (
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
