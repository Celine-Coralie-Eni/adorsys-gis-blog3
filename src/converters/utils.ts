import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import * as path from 'node:path';
import { markdownToHtml } from './converter';

export async function loadDocMd(
    ...slug: string[]
) {
    const fullPath = path.join(process.cwd(), 'docs', `${slug.join('/')}.md`);
    let fileContents: string;
    try {
        fileContents = readFileSync(fullPath, 'utf8');
    } catch (err) {
        // Propagate a controlled error to allow route to render a friendly UI
        const notFoundError = new Error('NotFound');
        notFoundError.name = 'NotFound';
        throw notFoundError;
    }

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    const html = await markdownToHtml(matterResult.content);

    return {
        ...matterResult.data,
        title: matterResult.data!.title,
        slug: matterResult.data?.slug,
        content: html,
    };
}

export async function loadSlideMd(
    ...slug: string[]
) {
    const fullPath = path.join(process.cwd(), 'docs', `${slug.join('/')}.md`);
    const fileContents = readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    return {
        ...matterResult.data,
        slug: matterResult.data?.slug,
        content: matterResult.content,
    };
}

export async function loadRes(slug: string): Promise<Record<string, string>> {
    return loadDocMd('res', slug);
}


export async function loadBlog(blog_slug: string) {
    const [course, slides] = await Promise.all([
        loadDocMd('blog', blog_slug, 'course'),
        loadSlideMd('blog', blog_slug, 'slides').catch(() => undefined),
    ]);

    return {
        course, slides
    }
}
