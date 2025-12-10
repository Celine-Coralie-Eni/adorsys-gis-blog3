"use client";
import "@blog/i18n/boot";

import { useRef, useState, type PropsWithChildren } from "react";
import { api } from "@blog/trpc/react";
import { CourseCard } from "@blog/components/course";
import { Search as SearchIcon, X as ClearIcon, Filter as FilterIcon } from "react-feather";
import { useTranslation } from "react-i18next";
import { FilterModal } from "@blog/components/FilterModal";

interface CoursesSearchProps extends PropsWithChildren {
  onFiltersChange?: (filters: { domains: string[]; authors: string[]; tags: string[] }) => void;
  activeFilters?: { domains: string[]; authors: string[]; tags: string[] };
}

export function CoursesSearch({ children, onFiltersChange, activeFilters }: CoursesSearchProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const enabled = query.trim().length > 0;
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const defaultFilters = { domains: [], authors: [], tags: [] };
  const currentFilters = activeFilters ?? defaultFilters;
  const activeFilterCount = currentFilters.domains.length + currentFilters.authors.length + currentFilters.tags.length;

  const { data, isFetching } = api.search.cards.useQuery(
    { q: query, limit: 25, lang: i18n.language?.startsWith("fr") ? "fr" : "en" },
    { enabled }
  );

  return (
    <div className="w-full">
      <div className="mb-3 sm:mb-4 mx-auto w-full md:w-3/4 lg:w-1/2 max-w-3xl px-4 sm:px-0 relative">
        {/* Filter Button - Positioned absolutely to not affect search width */}
        <div className="absolute left-4 sm:left-0 top-0 flex items-center gap-1 z-10">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="relative inline-flex h-9 sm:h-10 items-center justify-center rounded-full px-3 sm:px-4 backdrop-blur-xl
                       ring-1 ring-white/20 hover:ring-primary/40
                       bg-gradient-to-r from-white/10 via-white/5 to-white/10
                       transition-all hover:scale-105"
            aria-label="Filter"
          >
            <FilterIcon size={16} className="text-white/90" />
            {activeFilterCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-cyan-500 text-white text-xs font-semibold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear Filters X Button - shown when filters are active */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                if (onFiltersChange) {
                  onFiltersChange({ domains: [], authors: [], tags: [] });
                }
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full
                        bg-white/10 hover:bg-white/20 transition-all hover:scale-105"
              aria-label="Clear all filters"
              title="Clear all filters"
            >
              <ClearIcon size={14} className="text-white/90" />
            </button>
          )}
        </div>

        {/* Search Form - Full width */}
        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
          }}
          ref={formRef}
        >
          <div
            className="flex w-full items-center rounded-full px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-xl
                       ring-1 ring-white/20 focus-within:ring-primary/40
                       bg-gradient-to-r from-white/10 via-white/5 to-white/10"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent text-white placeholder-white/70 outline-none text-xs sm:text-sm"
              aria-label="Search"
              ref={inputRef}
            />
            {enabled ? (
              <button
                type="button"
                className="ml-1 inline-flex h-7 sm:h-9 w-7 sm:w-9 items-center justify-center rounded-full btn btn-accent btn-circle min-h-0 border-0"
                aria-label="Clear search"
                title="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                <ClearIcon size={14} className="sm:w-[16px] sm:h-[16px]" />
              </button>
            ) : (
              <button
                type="submit"
                className="ml-1 inline-flex h-7 sm:h-9 w-7 sm:w-9 items-center justify-center rounded-full btn btn-accent btn-circle min-h-0 border-0"
                aria-label="Submit search"
                title="Search"
              >
                <SearchIcon size={14} className="sm:w-[16px] sm:h-[16px]" />
              </button>
            )}
          </div>
        </form>
      </div>

      {enabled ? (
        <div className="mt-12 sm:mt-16 md:mt-24 xl:mt-28">
          {isFetching && (
            <div className="text-xs sm:text-sm opacity-70">{t("search.searching")}</div>
          )}
          {!isFetching && data && data.length === 0 && (
            <div className="text-xs sm:text-sm opacity-70">{t("search.noResults")}</div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map(({ slug, title, description, lang, tags, previews }) => (
              <CourseCard
                key={slug}
                slug={slug}
                title={title}
                description={description}
                lang={lang}
                tags={tags}
                slide1Html={previews?.firstHtml}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-12 sm:mt-16 md:mt-24 xl:mt-28">{children}</div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialFilters={currentFilters}
        onApply={(filters) => {
          if (onFiltersChange) {
            onFiltersChange(filters);
          }
        }}
      />
    </div>
  );
}