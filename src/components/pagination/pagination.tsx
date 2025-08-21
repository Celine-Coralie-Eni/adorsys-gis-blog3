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
      className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 rounded-md bg-black text-neutral-300"
    >
      {/* Previous */}
      <Link
        href={getPageUrl(Math.max(1, currentPage - 1))}
        onClick={preventIfDisabled(isPrevDisabled)}
        aria-disabled={isPrevDisabled}
        aria-label={t("Previous Page")}
        tabIndex={isPrevDisabled ? -1 : 0}
        className={`${
          isPrevDisabled
            ? "pointer-events-none cursor-not-allowed text-neutral-600"
            : "hover:text-white"
        } px-1.5 py-1 text-[11px] sm:px-2 sm:py-1.5 sm:text-xs`}
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
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
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
            className={`${
              page === currentPage
                ? "bg-neutral-800 text-white"
                : "bg-black text-neutral-300 hover:text-white"
            } border border-neutral-800 rounded px-1.5 py-1 text-[11px] sm:px-2 sm:py-1.5 sm:text-xs`}
          >
            <span>{page}</span>
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
        className={`${
          isNextDisabled
            ? "pointer-events-none cursor-not-allowed text-neutral-600"
            : "hover:text-white"
        } px-1.5 py-1 text-[11px] sm:px-2 sm:py-1.5 sm:text-xs`}
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
