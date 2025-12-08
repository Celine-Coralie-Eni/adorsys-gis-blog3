"use client";
import "@blog/i18n/boot";

import { useRef, useState, type PropsWithChildren, useEffect } from "react";
import { api } from "@blog/trpc/react";
import { CourseCard } from "@blog/components/course";
import { Search as SearchIcon, X as ClearIcon } from "react-feather";
import { useTranslation } from "react-i18next";
import { useIntersection } from "@mantine/hooks";

export function CoursesSearch({ children, filterSlot }: PropsWithChildren<{ filterSlot?: React.ReactNode }>) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const enabled = query.trim().length > 0;
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = api.search.cards.useInfiniteQuery(
    {
      q: query,
      limit: 10,
      lang: i18n.language?.startsWith("fr") ? "fr" : "en",
    },
    {
      enabled,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const searchResults = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="w-full">
      <div className="mb-3 sm:mb-4 mx-auto w-full md:w-3/4 lg:w-1/2 max-w-3xl px-4 sm:px-0 flex items-center gap-2">
        {filterSlot}
        <form
          className="flex-1"
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
          {isFetching && !isFetchingNextPage && (
            <div className="text-xs sm:text-sm opacity-70">{t("search.searching")}</div>
          )}
          {!isFetching && searchResults.length === 0 && (
            <div className="text-xs sm:text-sm opacity-70">{t("search.noResults")}</div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((item, i) => {
              const isLast = i === searchResults.length - 1;
              const card = (
                <CourseCard
                  key={item.slug}
                  slug={item.slug}
                  title={item.title ?? item.slug}
                  description={item.description}
                  lang={item.lang}
                  tags={item.tags}
                  author={item.author}
                  readingTime={item.readingTime}
                />
              );
              return isLast ? <div key={item.slug} ref={ref}>{card}</div> : card;
            })}
          </div>
          {isFetchingNextPage && <p className="mt-4 text-center text-sm opacity-70">Loading more...</p>}
        </div>
      ) : (
        <div className="mt-12 sm:mt-16 md:mt-24 xl:mt-28">{children}</div>
      )}
    </div>
  );
} 