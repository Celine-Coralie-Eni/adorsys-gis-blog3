"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useMemo, type MouseEvent } from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // e.g., "/courses"
  maxVisiblePages?: number; // default 5
}

function computeVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): number[] {
  const clampedMax = Math.max(1, Math.floor(maxVisible));
  if (totalPages <= clampedMax) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(clampedMax / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + clampedMax - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - clampedMax + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  maxVisiblePages = 5,
}: Readonly<PaginationProps>) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const visiblePages = useMemo(
    () => computeVisiblePages(currentPage, totalPages, maxVisiblePages),
    [currentPage, totalPages, maxVisiblePages]
  );

  const getPageUrl = (page: number): string => {
    // Preserve current query params (like lang), override page
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  if (!Number.isFinite(totalPages) || totalPages <= 1) return null;

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  const preventIfDisabled = (disabled: boolean) => (e: MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <nav
      aria-label="Course navigation"
      className="glass-surface flex items-center gap-1 rounded-2xl px-2 py-2 backdrop-saturate-150 sm:gap-2 md:gap-3 sm:px-3"
    >
      {/* Previous */}
      <Link
        href={getPageUrl(Math.max(1, currentPage - 1))}
        onClick={preventIfDisabled(isPrevDisabled)}
        aria-disabled={isPrevDisabled}
        aria-label={t("Previous Page")}
        tabIndex={isPrevDisabled ? -1 : 0}
        className={`group particle-deconstruct relative rounded-xl border border-transparent px-1.5 py-1.5 font-medium text-xs backdrop-blur-md transition-all duration-300 sm:px-2 sm:py-2 md:px-3 md:py-2.5 lg:px-4 ${
          isPrevDisabled
            ? "pointer-events-none cursor-not-allowed text-neutral-400 opacity-50"
            : "text-neutral-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-1">
          <svg
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-80 sm:w-[14px] sm:h-[14px]"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">{t("Previous")}</span>
        </span>
      </Link>

      {/* Pages */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
        {visiblePages.map((page) => (
          <Link
            key={page}
            href={getPageUrl(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={
              page === currentPage
                ? t("Current Page {{page}}", { page })
                : t("Go to Page {{page}}", { page })
            }
            className={`group particle-deconstruct relative rounded-xl border px-1.5 py-1.5 font-medium text-xs backdrop-blur-md transition-all duration-300 hover:scale-105 sm:px-2 sm:py-2 md:px-3 md:py-2.5 lg:px-4 sm:text-sm ${
              page === currentPage
                ? "border-primary/40 bg-gradient-to-r from-primary/30 to-secondary/30 text-base-content shadow-lg shadow-primary/20 hover:border-primary/60 hover:from-primary/40 hover:to-secondary/40 hover:shadow-primary/30 hover:shadow-xl"
                : "border-transparent text-neutral-400 hover:border-white/20 hover:bg-white/10 hover:text-base-content"
            }`}
          >
            <div
              className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                page === currentPage
                  ? "bg-gradient-to-r from-primary/20 to-secondary/20"
                  : "bg-gradient-to-r from-primary/10 to-secondary/10"
              }`}
            />
            <span className="relative z-10">{page}</span>
          </Link>
        ))}
      </div>

      {/* Next */}
      <Link
        href={getPageUrl(Math.min(totalPages, currentPage + 1))}
        onClick={preventIfDisabled(isNextDisabled)}
        aria-disabled={isNextDisabled}
        aria-label={t("Next Page")}
        tabIndex={isNextDisabled ? -1 : 0}
        className={`group particle-deconstruct relative rounded-xl border border-transparent px-1.5 py-1.5 font-medium text-xs backdrop-blur-md transition-all duration-300 sm:px-2 sm:py-2 md:px-3 md:py-2.5 lg:px-4 ${
          isNextDisabled
            ? "pointer-events-none cursor-not-allowed text-neutral-400 opacity-50"
            : "text-neutral-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-1">
          <span className="hidden sm:inline">{t("Next")}</span>
          <svg
            aria-hidden="true"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-80 sm:w-[14px] sm:h-[14px]"
          >
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </nav>
  );
}

export default Pagination;
