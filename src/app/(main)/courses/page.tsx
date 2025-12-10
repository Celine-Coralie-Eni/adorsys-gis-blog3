import { getAllBlogs } from "@blog/server/blog";
import { loadBlog } from "@blog/converters";
import { getSlidePreviewHtmls } from "@blog/server/blog/slide-preview";
import { LanguageRedirect } from "./LanguageRedirect";
import { CoursesProvider } from "./CoursesProvider";
import { CoursesClient } from "./CoursesClient";
import * as fs from "fs-extra";
import * as path from "node:path";
import createdDates from "@blog/server/blog/created-dates.json";

// This is now a static page that pre-fetches all data at build time
export const dynamic = "force-static";

async function getCourses() {
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

        // Extract authors field
        const authors = typeof (course as any)?.authors === "string"
          ? (course as any).authors
          : undefined;

        // Extract domain field
        const domain = typeof (course as any)?.domain === "string"
          ? (course as any).domain
          : undefined;

        // Determine created date: prefer course front matter, then slides, then generated mapping, then file mtime
        let created: string | undefined = undefined;
        if (typeof (course as any)?.date === "string") {
          created = (course as any).date as string;
        } else if (typeof (slides as any)?.date === "string") {
          created = (slides as any).date as string;
        } else if (
          createdDates &&
          typeof (createdDates as Record<string, string>)[slug] === "string"
        ) {
          created = (createdDates as Record<string, string>)[slug];
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
          } catch { }
        }

        return {
          slug,
          title: course?.title ?? slug,
          description: plain,
          lang,
          previews,
          tags,
          authors,
          domain,
          date: created,
        };
      } catch {
        return {
          slug,
          title: slug,
          description: undefined,
          lang: undefined,
          previews: {},
          authors: undefined,
          domain: undefined,
        };
      }
    })
  );

  return courses;
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <LanguageRedirect />
      <CoursesProvider>
        <CoursesClient courses={courses} />
      </CoursesProvider>
    </>
  );
}
