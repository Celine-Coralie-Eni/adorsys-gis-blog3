"use client";
import "@blog/i18n/boot";

import { useMemo } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { Container } from "@blog/components/container";
import { CourseCard } from "@blog/components/course";
import { PaginationNuqs } from "@blog/components/pagination/pagination-nuqs";
import { CoursesHeader } from "./CoursesHeader";
import { CoursesSearch } from "./CoursesSearch";
import { api } from "@blog/trpc/react";

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
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [domain, setDomain] = useQueryState("domain", parseAsString.withDefault("all"));

  // Fetch all domains
  const { data: domains = [] } = api.search.domains.useQuery();

  const perPage = 8;

  // Filter courses based on domain only
  const filtered = useMemo(() => {
    return courses.filter((c) => {
      // Domain filter
      if (domain !== "all" && c.domain !== domain) return false;
      return true;
    });
  }, [courses, domain]);

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
        <CoursesSearch>
          <div className="w-full">
            {/* Domain Selector */}
            <div className="mb-6 sm:mb-8">
              <select
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="" disabled className="bg-gray-900">Domains</option>
                <option value="all" className="bg-gray-900">All Domains</option>
                {domains.map((d) => (
                  <option key={d} value={d} className="bg-gray-900">{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:gap-8 lg:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map(
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
