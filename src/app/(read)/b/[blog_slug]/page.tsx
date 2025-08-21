import { Container } from "@blog/components/container";
import { redirect } from "next/navigation";
import { loadBlog } from "@blog/converters";
import { getAllBlogs } from "@blog/server/blog/api";
import Display from "@blog/components/display";
import Link from "next/link";
import { headers } from "next/headers";
import ProseFixer from "@blog/components/display/ProseFixer";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const pages = await getAllBlogs();
  return pages.map((blog_slug) => ({ blog_slug }));
}

interface Props {
  params: Promise<{ blog_slug: string }>;
  searchParams?: Promise<{ returnTo?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { blog_slug } = await params;
  if (!blog_slug) {
    return null;
  }

  try {
    const { course } = await loadBlog(blog_slug);
    if (!course || !course.title) {
      return { title: `${blog_slug} | adorsys GIS` };
    }
    return {
      title: `${course.title} | adorsys GIS`,
    };
  } catch {
    // Gracefully fall back when course metadata cannot be loaded
    return { title: `${blog_slug} | adorsys GIS` };
  }
}

export default async function SingleBlogPage({ params, searchParams }: Props) {
  const { blog_slug } = await params;
  if (!blog_slug) {
    return redirect("/courses");
  }

  // Determine the best back link once so both success and error states share it
  const headerList = await headers();
  const referer = headerList.get("referer") || undefined;
  const sp = (await searchParams) ?? {};
  const backHref = sp.returnTo ?? referer ?? "/courses";
  const reloadHref = sp.returnTo
    ? `/b/${blog_slug}?returnTo=${encodeURIComponent(sp.returnTo)}`
    : `/b/${blog_slug}`;

  try {
    const { course, slides } = await loadBlog(blog_slug);
    return (
      <Container>
        <ProseFixer />
        <div className="mt-6 sm:mt-8 mb-4 flex justify-start">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white hover:font-extrabold transition-colors px-1"
            aria-label="Back to blogs"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to blogs
          </Link>
        </div>
        {slides && <Display data={slides.content} />}

        {course.content && (
          <article className="prose prose-neutral lg:prose-xl mx-auto mt-8 text-justify px-8">
            <div dangerouslySetInnerHTML={{ __html: course.content }} />
          </article>
        )}
      </Container>
    );
  } catch {
    return (
      <Container>
        <div className="hero min-h-[60vh] bg-base-200 rounded-2xl mt-6">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold md:text-5xl">
                This course does not exist yet
              </h1>
              <p className="mx-auto mt-3 max-w-xl opacity-80">
                Please check the link or try again later.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a className="btn btn-outline" href={reloadHref}>
                  Reload
                </a>
                <a className="btn btn-primary" href={backHref}>
                  Return to Blogs
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }
}
