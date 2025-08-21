// removed unused Link import
import { getAllBlogs } from "@blog/server/blog";
import { loadBlog } from "@blog/converters";
import { Container } from "@blog/components/container";
import { CourseCard } from "@blog/components/course";
import { Pagination } from "@blog/components/pagination";
import { getSlidePreviewHtmls } from "@blog/server/blog/slide-preview";
import { CoursesHeader } from "./CoursesHeader";
import { CoursesSearch } from "./CoursesSearch";
import { LanguageRedirect } from "./LanguageRedirect";
import * as fs from "fs-extra";
import * as path from "node:path";

export const dynamic = "force-dynamic";

type Props = { searchParams?: Promise<{ lang?: string; page?: string }> };

export default async function CoursesPage({ searchParams }: Props) {
  const params = await searchParams;
  // Default to English; treat missing course lang as 'en'
  const selected = (params?.lang ?? "en").toLowerCase();
  const pageParam =
    typeof params?.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const perPage = 8;

  const slugs = await getAllBlogs();
  const courses = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const { course, slides } = await loadBlog(slug);
        const plain = course?.content
          ?.replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        let lang: string | undefined = undefined;
        if (typeof (course as any)?.lang === "string") {
          lang = (course as any).lang;
        }
        const previews = await getSlidePreviewHtmls(slug);
        const rawTags = (course as any)?.tags as unknown;
        let tags: string[] | undefined = undefined;
        if (Array.isArray(rawTags)) {
          tags = (rawTags as any[]).map((t) => String(t));
        } else if (typeof rawTags === "string") {
          tags = rawTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
        // Determine created date: prefer course front matter, then slides, then file mtime
        let created: string | undefined = undefined;
        if (typeof (course as any)?.date === "string") {
          created = (course as any).date as string;
        } else if (typeof (slides as any)?.date === "string") {
          created = (slides as any).date as string;
        } else {
          try {
            const coursePath = path.join(
              process.cwd(),
              "docs",
              "blog",
              slug,
              "course.md"
            );
            const stat = await fs.stat(coursePath);
            created = stat.mtime.toISOString();
          } catch {}
        }

        return {
          slug,
          title: course?.title ?? slug,
          description: plain,
          lang,
          previews,
          tags,
          date: created,
        };
      } catch {
        return {
          slug,
          title: slug,
          description: undefined,
          lang: undefined,
          previews: {},
        };
      }
    })
  );

  const filtered = courses.filter((c) => {
    if (selected === "fr") return (c.lang ?? "").toLowerCase() === "fr";
    // Default 'en': include english or missing lang
    return (c.lang?.toLowerCase() ?? "en") === "en";
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  function linkFor(targetPage: number) {
    const params = new URLSearchParams();
    // Only include 'lang' when not default 'en' to keep URLs clean
    if (selected !== "en") params.set("lang", selected);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/courses?${qs}` : "/courses";
  }

  const currentListUrl = linkFor(current);

  return (
    <>
      <LanguageRedirect />
      <div className="bg-black">
        <Container>
          <div className="mb-6 space-y-4">
            <CoursesHeader total={total} />
          </div>
          <CoursesSearch>
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
                <Pagination
                  currentPage={current}
                  totalPages={pageCount}
                  baseUrl={"/courses"}
                  maxVisiblePages={5}
                />
              </div>
            )}
          </CoursesSearch>
        </Container>
      </div>
    </>
  );
}
