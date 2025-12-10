"use client";

import { useQueryState, parseAsString, parseAsInteger, parseAsArrayOf } from "nuqs";
import { Container } from "@blog/components/container";
import { CourseCard } from "@blog/components/course";
import { PaginationNuqs } from "@blog/components/pagination/pagination-nuqs";
import { CoursesHeader } from "./CoursesHeader";
import { CoursesSearch } from "./CoursesSearch";
import { useMemo } from "react";

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
}

interface CoursesClientProps {
  courses: Course[];
}

export function CoursesClient({ courses }: CoursesClientProps) {
  const [lang, setLang] = useQueryState("lang", parseAsString.withDefault("en"));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [domains, setDomains] = useQueryState("domains", parseAsArrayOf(parseAsString).withDefault([]));
  const [authors, setAuthors] = useQueryState("authors", parseAsArrayOf(parseAsString).withDefault([]));
  const [tags, setTags] = useQueryState("tags", parseAsArrayOf(parseAsString).withDefault([]));

  const perPage = 8;

  // Filter courses based on language, domains, authors, and tags
  const filtered = useMemo(() => {
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

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  // Generate current URL for returnTo parameter
  const currentListUrl = `/courses${lang !== "en" ? `?lang=${lang}` : ""}${current > 1 ? `${lang !== "en" ? "&" : "?"}page=${current}` : ""}`;

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
            {pageItems.map(
              ({ slug, title, description, lang, previews, tags, date }) => (
                <CourseCard
                  key={slug}
                  slug={slug}
                  title={title}
                  description={description}
                  lang={lang}
                  slide1Html={(previews as any)?.firstHtml}
                  tags={tags}
                  date={date}
                  returnTo={currentListUrl}
                />
              )
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
