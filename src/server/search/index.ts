import * as fs from 'fs-extra';
import * as path from 'node:path';
import matter from 'gray-matter';

export interface SearchDocument {
    id: string;
    title: string;
    slug: string;
    url: string;
    type: 'blog' | 'res' | 'doc';
    content: string;
    tags?: string[];
    author?: string;
    readingTime?: number;
}

export interface SearchResultItem {
    id: string;
    title: string;
    url: string;
    type: SearchDocument['type'];
    snippet: string;
    score: number;
    author?: string;
    readingTime?: number;
}

let cachedIndex: SearchDocument[] | null = null;

async function listMarkdownFiles(rootDir: string): Promise<string[]> {
    const files: string[] = [];
    async function walk(current: string) {
        const entries = await fs.readdir(current, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) {
                await walk(full);
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
                files.push(full);
            }
        }
    }
    await walk(rootDir);
    return files;
}

function stripMarkdown(markdown: string): string {
    // Remove code blocks
    let text = markdown.replace(/```[\s\S]*?```/g, ' ');
    // Remove inline code
    text = text.replace(/`[^`]*`/g, ' ');
    // Remove images ![alt](url)
    text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
    // Remove links [text](url)
    text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    // Remove headings, emphasis, lists, blockquotes, tables markers
    text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
    text = text.replace(/[>*_~`#|-]/g, ' ');
    // Collapse whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

async function buildIndex(): Promise<SearchDocument[]> {
    const docsRoot = path.join(process.cwd(), 'docs');
    const files = await listMarkdownFiles(docsRoot);

    const docs: SearchDocument[] = [];
    for (const absPath of files) {
        const rel = path.relative(docsRoot, absPath).replace(/\\/g, '/');
        const fileContents = await fs.readFile(absPath, 'utf8');
        const matterResult = matter(fileContents);

        const contentPlain = stripMarkdown(matterResult.content ?? '');

        const pathParts = rel.split('/');
        const isBlog = pathParts[0] === 'blog' && pathParts.length >= 3;
        const isRes = pathParts[0] === 'res' && pathParts.length === 2;

        let type: 'blog' | 'res' | 'doc' = 'doc';
        let url = '';
        let slug = '';
        let tags: string[] | undefined;
        let author: string | undefined;
        let readingTime: number | undefined;

        if (isBlog) {
            type = 'blog';
            const blogSlug = pathParts[1]!;
            slug = blogSlug;
            url = `/b/${blogSlug}`;
            if (rel.endsWith('/course.md')) {
                const rawTags = matterResult.data.tags as unknown;
                if (Array.isArray(rawTags)) {
                    tags = rawTags.map((t) => String(t));
                } else if (typeof rawTags === 'string') {
                    tags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
                }
                const rawAuthors = matterResult.data.authors as unknown;
                author = Array.isArray(rawAuthors) && typeof rawAuthors[0] === 'string'
                    ? rawAuthors[0]
                    : typeof rawAuthors === 'string'
                    ? rawAuthors
                    : undefined;

                const content = matterResult.content || '';
                const plainText = content.replace(/<[^>]+>/g, ' ');
                const words = plainText.trim().split(/\s+/).filter(Boolean).length;
                readingTime = Math.max(1, Math.ceil(words / 60));
            }
        } else if (isRes) {
            type = 'res';
            const resSlug = pathParts[1]!.replace(/\.md$/i, '');
            slug = resSlug;
            url = `/res/${resSlug}`;
        } else {
            type = 'doc';
            slug = rel.replace(/\.md$/i, '');
            url = `/`;
        }

        const titleFromFrontMatter = (matterResult.data as Record<string, unknown>)?.title;
        const title = typeof titleFromFrontMatter === 'string' && titleFromFrontMatter.trim().length > 0
            ? titleFromFrontMatter.trim()
            : slug;

        docs.push({
            id: rel,
            title,
            slug,
            url,
            type,
            content: contentPlain,
            tags,
            author,
            readingTime,
        });
    }

    // Deduplicate by id
    const unique = new Map<string, SearchDocument>();
    for (const d of docs) unique.set(d.id, d);
    return Array.from(unique.values());
}

export async function ensureIndex(): Promise<SearchDocument[]> {
    if (cachedIndex) return cachedIndex;
    cachedIndex = await buildIndex();
    return cachedIndex;
}

function scoreDocument(query: string, doc: SearchDocument): number {
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0;

    let score = 0;
    const titleLower = doc.title.toLowerCase();
    const contentLower = doc.content.toLowerCase();
    const tagsLower = (doc.tags ?? []).map((t) => t.toLowerCase());
    const authorLower = (doc.author ?? '').toLowerCase();

    for (const w of words) {
        if (titleLower.includes(w)) score += 5;
        const titleMatches = titleLower.split(w).length - 1;
        score += titleMatches * 10; // strong boost for title frequency

        if (contentLower.includes(w)) score += 1;
        const contentMatches = contentLower.split(w).length - 1;
        score += contentMatches * 2;

        // Boost for tag matches
        for (const t of tagsLower) {
            if (t === w) {
                score += 120; // exact tag match: very strong
            } else if (t.includes(w)) {
                score += 40; // partial tag match
            }
        }

        // Boost for author matches
        if (authorLower) {
            if (authorLower === w) {
                score += 100; // exact author match: very strong
            } else if (authorLower.includes(w)) {
                score += 50; // partial author match
            }
        }
    }

    // Slight boost by type if desired
    if (doc.type === 'blog') score += 1;

    return score;
}

function makeSnippet(content: string, query: string, size = 180): string {
    if (!content) return '';
    const lower = content.toLowerCase();
    const q = query.toLowerCase();
    const firstIdx = lower.indexOf(q);
    const idx = firstIdx >= 0 ? firstIdx : 0;
    const start = Math.max(0, idx - Math.floor(size / 2));
    const end = Math.min(content.length, start + size);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < content.length ? '…' : '';
    return `${prefix}${content.slice(start, end).trim()}${suffix}`;
}

export async function searchContent(query: string, limit = 20): Promise<SearchResultItem[]> {
    const index = await ensureIndex();
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    // 1a) If the query matches any author exactly, return only blog posts by that author
    const allAuthors = [...new Set(index.map(doc => doc.author).filter((a): a is string => !!a))].map(a => a.toLowerCase());
    const queryLower = query.toLowerCase();
    if (allAuthors.includes(queryLower)) {
        const authorMatchedDocs = index.filter(doc => doc.author?.toLowerCase() === queryLower);
        return authorMatchedDocs.map(doc => ({
            id: doc.id,
            title: doc.title,
            url: doc.url,
            type: doc.type,
            snippet: makeSnippet(doc.content, query),
            score: 1000, // Max score to ensure they are on top
            author: doc.author,
            readingTime: doc.readingTime,
        }));
    }

    // 1b) If the query matches any tag exactly, return only blog posts with that tag
    else {
        const tagMatchedDocs = index.filter((doc) =>
            doc.type === 'blog' && (doc.tags ?? []).some((t) => words.includes(t.toLowerCase()))
        );

        if (tagMatchedDocs.length > 0) {
            const results = tagMatchedDocs
                .map((doc) => ({
                    id: doc.id,
                    title: doc.title,
                    url: doc.url,
                    type: doc.type,
                    snippet: makeSnippet(doc.content, query),
                    score: 1000, // strong, deterministic ordering later by dedupe/map
                    author: doc.author,
                    readingTime: doc.readingTime,
                }))
                // Deduplicate by URL in case both course/slides exist with same URL; prefer first
                .reduce((acc, item) => {
                    const existing = acc.get(item.url);
                    if (!existing || item.score > existing.score) acc.set(item.url, item);
                    return acc;
                }, new Map<string, SearchResultItem>())
                ;
            return Array.from(results.values()).slice(0, limit);
        }
    }

    // 2) Otherwise do full-text scoring but only for blog posts, and dedupe by URL
    const byScore = index
        .filter((doc) => doc.type === 'blog')
        .map((doc) => ({ doc, score: scoreDocument(query, doc) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);

    const deduped = new Map<string, SearchResultItem>();
    for (const { doc, score } of byScore) {
        const item: SearchResultItem = {
            id: doc.id,
            title: doc.title,
            url: doc.url,
            type: doc.type,
            snippet: makeSnippet(doc.content, query),
            score,
            author: doc.author,
            readingTime: doc.readingTime,
        };
        const prev = deduped.get(item.url);
        if (!prev || item.score > prev.score) deduped.set(item.url, item);
        if (deduped.size >= limit) break;
    }
    return Array.from(deduped.values());
}

