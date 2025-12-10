import * as fs from "fs-extra";
import * as path from "node:path";
import _ from "lodash";
import matter from "gray-matter";

async function* dir_api(dir: string) {
    for await (const d of await fs.promises.opendir(dir)) {
        if (d.isDirectory()) yield* [d.name];
    }
}

function calculateReadingTime(content: string): number {
    // Strip HTML tags
    const plainText = content.replace(/<[^>]+>/g, ' ');
    // Count words
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    // A more conservative reading speed: 60 words per minute
    const minutes = Math.ceil(words / 60);
    return Math.max(1, minutes); // At least 1 minute
}

export async function getAllBlogs() {
    const fullPath = path.join(process.cwd(), 'docs', 'blog');
    const dirs = dir_api(fullPath);
    const list = [];
    for await (let d of dirs) {
        list.push(d);
    }
    return _.uniq(list);
}

export type BlogMeta = {
    slug: string;
    title?: string;
    description?: string;
    lang?: string;
    tags?: string[];
    authors?: string;
    domain?: string;
};

export async function getAllBlogMeta(): Promise<BlogMeta[]> {
    const blogSlugs = await getAllBlogs();
    const metas: BlogMeta[] = [];
    for (const blogSlug of blogSlugs) {
        const coursePath = path.join(process.cwd(), 'docs', 'blog', blogSlug, 'course.md');
        if (await fs.pathExists(coursePath)) {
            const file = await fs.readFile(coursePath, 'utf8');
            const parsed = matter(file);
            const data = parsed.data as Record<string, any>;
            const rawTags = data.tags as unknown;
            const tags = Array.isArray(rawTags)
                ? rawTags.map((t) => String(t))
                : typeof rawTags === 'string'
                    ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
                    : undefined;

            // Extract authors field
            const authors = typeof data.authors === 'string' ? data.authors : undefined;

            // Extract domain field
            const domain = typeof data.domain === 'string' ? data.domain : undefined;

            metas.push({
                slug: blogSlug,
                title: typeof data.title === 'string' ? data.title : undefined,
                description: typeof data.description === 'string' ? data.description : undefined,
                lang: typeof data.lang === 'string' ? data.lang : undefined,
                tags,
                authors,
                domain,
            });
        } else {
            metas.push({ slug: blogSlug });
        }
    }
    return metas;
}
