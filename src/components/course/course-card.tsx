"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useReturnTo } from "@blog/components/navigation/useReturnTo";

interface CourseCardProps {
  slug: string;
  title: string;
  description?: string;
  lang?: string;
  slide1Html?: string;
  tags?: string[];
  date?: string;
  author?: string;
  readingTime?: number;
  // When provided, used to construct a return URL so the detail page can
  // navigate back to the originating list with correct pagination/filters
  returnTo?: string;
}

export function CourseCard({
  slug,
  title,
  description,
  lang,
  slide1Html,
  tags,
  date,
  author,
  readingTime,
  returnTo,
}: Readonly<CourseCardProps>) {
  const { t, i18n } = useTranslation();
  const locale = (i18n?.language ?? "").trim() || undefined;
  const formattedDate = (() => {
    if (!date) return undefined;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return undefined;
    try {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(d);
    } catch {
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
    }
  })();
  const hasSlides =
    typeof (slide1Html ?? "") === "string" &&
    (slide1Html ?? "").trim().length > 0;
  const hasCourse =
    typeof (description ?? "") === "string" &&
    (description ?? "").trim().length > 0;
  // Description fallback logic
  let computedDescription: string | undefined = description;
  if (!hasCourse) {
    computedDescription = t("courseCard.contentSoon");
  }

  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const currentUrl = useReturnTo();
  const blogHref = `/b/${slug}?returnTo=${encodeURIComponent(
    returnTo ?? currentUrl
  )}`;

  return (
    <Link
      href={blogHref}
      className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black"
      aria-label={`Open course ${title}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* minimal, no overlays */}

        {hasSlides && slide1Html?.includes("<img") ? (
          <div className="relative w-full overflow-hidden bg-black">
            <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48">
              <div className="slide-preview absolute inset-0">
                <div className="slide-preview-inner h-full w-full overflow-hidden">
                  <div
                    className="prose prose-invert h-full w-full overflow-hidden [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:p-0 [&_img]:m-0 [&_*]:p-0 [&_*]:m-0"
                    dangerouslySetInnerHTML={{ __html: slide1Html }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden bg-black">
            <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48">
              <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="#fff"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_4418_7518)">
                    <path
                      d="M11.9998 22.0795C11.6998 22.0795 11.3998 22.0095 11.1498 21.8695C9.27978 20.8495 5.99976 19.7695 3.93976 19.4995L3.64978 19.4595C2.33978 19.2995 1.25977 18.0695 1.25977 16.7395V4.6595C1.25977 3.8695 1.56977 3.14953 2.13977 2.62953C2.70977 2.10953 3.44974 1.85952 4.22974 1.92952C6.41974 2.10952 9.73975 3.20953 11.6198 4.37953L11.8597 4.51955C11.9297 4.54955 12.0798 4.55955 12.1398 4.51955L12.2997 4.41951C12.9697 3.99951 13.8097 3.5895 14.7297 3.2195C14.9597 3.1295 15.2197 3.15951 15.4297 3.29951C15.6397 3.43951 15.7598 3.66951 15.7598 3.91951V6.5995L16.5898 6.04951C16.8398 5.87951 17.1697 5.87951 17.4197 6.04951L18.2498 6.5995V2.77956C18.2498 2.41956 18.5097 2.1095 18.8597 2.0395C19.1497 1.9895 19.4398 1.94952 19.6998 1.92952C19.7198 1.92952 19.7998 1.92952 19.8198 1.92952C20.5498 1.86952 21.2997 2.11954 21.8597 2.63954C22.4297 3.15954 22.7397 3.87951 22.7397 4.66951V16.7395C22.7397 18.0795 21.6598 19.2995 20.3398 19.4595L20.0098 19.4995C17.9498 19.7695 14.6498 20.8595 12.8198 21.8695C12.5998 22.0095 12.2998 22.0795 11.9998 22.0795ZM3.97974 3.4095C3.65974 3.4095 3.36977 3.51951 3.13977 3.72951C2.88977 3.95951 2.74976 4.2895 2.74976 4.6595V16.7395C2.74976 17.3295 3.25977 17.8995 3.82977 17.9795L4.12976 18.0195C6.37976 18.3195 9.82977 19.4495 11.8298 20.5495C11.9198 20.5895 12.0497 20.5995 12.0997 20.5795C14.1097 19.4695 17.5698 18.3296 19.8298 18.0296L20.1697 17.9895C20.7397 17.9195 21.2498 17.3395 21.2498 16.7495V4.67952C21.2498 4.30952 21.1097 3.98953 20.8597 3.74953C20.6097 3.51953 20.2598 3.40952 19.8998 3.42952C19.8698 3.42952 19.7798 3.42952 19.7598 3.42952V7.99953C19.7598 8.27953 19.6097 8.5295 19.3597 8.6595C19.1097 8.7895 18.8198 8.77952 18.5898 8.61952L17.0098 7.56953L15.4297 8.61952C15.1997 8.76952 14.9097 8.7895 14.6597 8.6595C14.4197 8.5295 14.2598 8.27953 14.2598 7.99953V5.06953C13.8298 5.27953 13.4397 5.48953 13.0997 5.68953L12.9398 5.7895C12.3898 6.1295 11.6098 6.12951 11.0798 5.79951L10.8398 5.64955C9.14978 4.58955 6.06974 3.5695 4.10974 3.4095C4.05974 3.4095 4.01974 3.4095 3.97974 3.4095Z"
                      fill="white"
                    />
                    <path
                      d="M12 21.2402C11.59 21.2402 11.25 20.9002 11.25 20.4902V5.49023C11.25 5.08023 11.59 4.74023 12 4.74023C12.41 4.74023 12.75 5.08023 12.75 5.49023V20.4902C12.75 20.9102 12.41 21.2402 12 21.2402Z"
                      fill="white"
                    />
                    <path
                      d="M19 8.75048C18.85 8.75048 18.71 8.71047 18.58 8.62047L17 7.57048L15.42 8.62047C15.19 8.77047 14.9 8.79045 14.65 8.66045C14.41 8.53045 14.25 8.28048 14.25 8.00048V3.92046C14.25 3.61046 14.44 3.34045 14.72 3.22045C16.1 2.67045 17.61 2.24046 18.88 2.04046C19.1 2.00046 19.32 2.0705 19.49 2.2105C19.66 2.3505 19.75 2.56051 19.75 2.78051V8.00048C19.75 8.28048 19.6 8.53045 19.35 8.66045C19.24 8.72045 19.12 8.75048 19 8.75048ZM17 5.92046C17.14 5.92046 17.29 5.96046 17.42 6.05046L18.25 6.60045V3.69048C17.45 3.87048 16.58 4.13048 15.75 4.44048V6.60045L16.58 6.05046C16.71 5.96046 16.86 5.92046 17 5.92046Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_4418_7518">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="relative p-3 sm:p-4 md:p-4 lg:p-5">
          <h3 className="mb-1.5 text-base sm:text-lg font-semibold text-white">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-400 mb-1.5">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && (readingTime || author) && <span>•</span>}
            {readingTime && <span>{formatReadingTime(readingTime)}</span>}
            {readingTime && author && <span>•</span>}
            {author && <span>by {author}</span>}
          </div>
          {computedDescription && (
            <p className="mb-2 sm:mb-3 line-clamp-3 text-xs sm:text-sm text-neutral-300">
              {computedDescription}
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 border border-neutral-700 text-neutral-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* No open button */}
        </div>
      </motion.div>
    </Link>
  );
}
