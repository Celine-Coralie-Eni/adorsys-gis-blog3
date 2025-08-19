import {Container} from '@blog/components/container';
import {redirect} from 'next/navigation';
import {loadBlog} from "@blog/converters";
import {getAllBlogs} from "@blog/server/blog/api";
import {Suspense} from "react";
import Display from "@blog/components/display";
import { Skeleton } from "@blog/components/loading/skeleton";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    const pages = await getAllBlogs();
    return pages.map((blog_slug) => ({blog_slug}));
}

interface Props {
    params: Promise<{ blog_slug: string }>;
}

export async function generateMetadata({params}: Props) {
    const {blog_slug} = await params;
    if (!blog_slug) {
        return null;
    }

    try {
        const {course} = await loadBlog(blog_slug);
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

export default async function SingleBlogPage({params}: Props) {
    const {blog_slug} = await params;
    if (!blog_slug) {
        return redirect('/');
    }

    const {course, slides} = await loadBlog(blog_slug);
    return (
        <Container>
            {/* language badge intentionally omitted on blog page per requirements */}
            {slides && (
                <Suspense fallback={<Skeleton className="h-64 w-full mb-8" />}>
                    <Display data={slides.content}/>
                </Suspense>
            )}

            {course.content && (
                <article className='prose prose-neutral lg:prose-xl mx-auto mt-8'>
                    <div dangerouslySetInnerHTML={{__html: course.content}}/>
                </article>
            )}
        </Container>
    );
}
