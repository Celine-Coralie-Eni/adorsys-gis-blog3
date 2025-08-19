import Link from "next/link";
import { getAllBlogs } from "@blog/server/blog";
import { loadBlog } from "@blog/converters";
import { Container } from "@blog/components/container";
import { CourseCard } from "@blog/components/course";
import { Pagination } from "@blog/components/pagination";
import { getSlidePreviewHtmls } from "@blog/server/blog/slide-preview";

export const dynamic = "force-dynamic";

type Props = { searchParams?: Promise<{ lang?: string; page?: string }> };

export default async function CoursesPage({ searchParams }: Props) {
  const params = await searchParams;
  const selected = (params?.lang ?? "all").toLowerCase();
  const pageParam =
    typeof params?.page === "string" ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const perPage = 6;

  const slugs = await getAllBlogs();
  const courses = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const { course } = await loadBlog(slug);
        const plain = course?.content
          ?.replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const lang =
          typeof (course as any)?.lang === "string"
            ? (course as any).lang
            : undefined;
        const tagsRaw = (course as any)?.tags;
        const tags = Array.isArray(tagsRaw)
          ? tagsRaw.map((t: unknown) => String(t))
          : typeof tagsRaw === "string"
          ? tagsRaw
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : undefined;
        const previews = await getSlidePreviewHtmls(slug);
        return {
          slug,
          title: course?.title ?? slug,
          description: plain,
          lang,
          tags,
          previews,
        };
      } catch {
        // When loading a course fails, still return a stub so the card can show a fallback
        return {
          slug,
          title: slug,
          description: undefined,
          lang: undefined,
          tags: undefined,
          previews: {},
        };
      }
    })
  );

  const filtered = courses.filter(({ lang }) => {
    const matchesLang =
      selected === "all" || (lang ?? "en").toLowerCase() === selected;
    return matchesLang;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  function linkFor(targetPage: number) {
    const params = new URLSearchParams();
    if (selected !== "all") params.set("lang", selected);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/courses?${qs}` : "/courses";
  }

  return (
    <Container>
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Courses</h1>
          <span className="badge badge-primary badge-lg">
            {total} courses available
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80">Language:</span>
          <div className="join">
            <Link
              className={`btn btn-sm join-item ${
                selected === "all" ? "btn-primary" : ""
              }`}
              href={"/courses"}
            >
              All
            </Link>
            <Link
              className={`btn btn-sm join-item ${
                selected === "en" ? "btn-primary" : ""
              }`}
              href={"/courses?lang=en"}
            >
              EN
            </Link>
            <Link
              className={`btn btn-sm join-item ${
                selected === "fr" ? "btn-primary" : ""
              }`}
              href={"/courses?lang=fr"}
            >
              FR
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map(({ slug, title, description, lang, tags, previews }) => (
          <CourseCard
            key={slug}
            slug={slug}
            title={title}
            description={description}
            lang={lang}
            tags={tags}
            slide1Html={(previews as any)?.firstHtml}
            slide2Html={(previews as any)?.secondHtml}
          />
        ))}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-10 flex items-center justify-center">
          <Pagination
            currentPage={current}
            totalPages={pageCount}
            baseUrl={"/courses"}
            maxVisiblePages={5}
          />
        </div>
      )}
    </Container>
  );
}
