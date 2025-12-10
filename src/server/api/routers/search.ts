import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@blog/server/api/trpc';
import { searchContent } from '@blog/server/search';
import { getAllBlogMeta } from '@blog/server/blog/api';
import { loadBlog } from '@blog/converters';
import { getSlidePreviewHtmls } from '@blog/server/blog/slide-preview';

export const searchRouter = createTRPCRouter({
    query: publicProcedure
        .input(z.object({ q: z.string().min(1), limit: z.number().min(1).max(50).optional(), lang: z.enum(["en", "fr"]).optional() }))
        .query(async ({ input }) => {
            const results = await searchContent(input.q, input.limit ?? 20);
            const lang = (input.lang ?? 'en').toLowerCase();
            const filtered = results.filter((r) => {
                // Only blog results matter for lang filtering; others are not returned anyway
                // We will re-check language at the cards endpoint; here keep all and let client decide if needed
                return true;
            });
            return filtered;
        }),
    tags: publicProcedure
        .query(async () => {
            const metas = await getAllBlogMeta();
            const all = new Set<string>();
            for (const m of metas) {
                for (const t of (m.tags ?? [])) {
                    const v = String(t).trim();
                    if (v) all.add(v);
                }
            }
            return Array.from(all).sort((a, b) => a.localeCompare(b));
        }),
    authors: publicProcedure
        .query(async () => {
            const metas = await getAllBlogMeta();
            const all = new Set<string>();
            for (const m of metas) {
                if (m.authors) {
                    const v = String(m.authors).trim();
                    if (v) all.add(v);
                }
            }
            return Array.from(all).sort((a, b) => a.localeCompare(b));
        }),
    domains: publicProcedure
        .query(async () => {
            const metas = await getAllBlogMeta();
            const all = new Set<string>();
            for (const m of metas) {
                if (m.domain) {
                    const v = String(m.domain).trim();
                    if (v) all.add(v);
                }
            }
            return Array.from(all).sort((a, b) => a.localeCompare(b));
        }),
    filters: publicProcedure
        .query(async () => {
            const metas = await getAllBlogMeta();
            const tagsSet = new Set<string>();
            const authorsSet = new Set<string>();
            const domainsSet = new Set<string>();

            for (const m of metas) {
                // Collect tags
                for (const t of (m.tags ?? [])) {
                    const v = String(t).trim();
                    if (v) tagsSet.add(v);
                }
                // Collect authors
                if (m.authors) {
                    const v = String(m.authors).trim();
                    if (v) authorsSet.add(v);
                }
                // Collect domains
                if (m.domain) {
                    const v = String(m.domain).trim();
                    if (v) domainsSet.add(v);
                }
            }

            return {
                tags: Array.from(tagsSet).sort((a, b) => a.localeCompare(b)),
                authors: Array.from(authorsSet).sort((a, b) => a.localeCompare(b)),
                domains: Array.from(domainsSet).sort((a, b) => a.localeCompare(b)),
            };
        }),
    cards: publicProcedure
        .input(z.object({
            q: z.string().min(1),
            limit: z.number().min(1).max(50).optional(),
            lang: z.enum(["en", "fr"]).optional(),
            domains: z.array(z.string()).optional(),
            authors: z.array(z.string()).optional(),
            tags: z.array(z.string()).optional(),
        }))
        .query(async ({ input }) => {
            const results = await searchContent(input.q, input.limit ?? 20);
            const blogResults = results.filter((r) => r.type === 'blog');
            const slugs = blogResults.map((r) => r.url.replace(/^\/?b\//, ''));

            const itemsRaw = await Promise.all(
                slugs.map(async (slug) => {
                    try {
                        const { course } = await loadBlog(slug);
                        const plain = course?.content
                            ?.replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        const lang = typeof (course as any)?.lang === 'string' ? (course as any).lang : undefined;
                        const tagsRaw = (course as any)?.tags as unknown;
                        const tags = Array.isArray(tagsRaw)
                            ? tagsRaw.map((t) => String(t))
                            : typeof tagsRaw === 'string'
                                ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
                                : undefined;
                        const authors = typeof (course as any)?.authors === 'string' ? (course as any).authors : undefined;
                        const domain = typeof (course as any)?.domain === 'string' ? (course as any).domain : undefined;
                        const previews = await getSlidePreviewHtmls(slug);
                        return { slug, title: course?.title ?? slug, description: plain, lang, tags, authors, domain, previews };
                    } catch {
                        // Ignore missing or unreadable blogs (e.g., ENOENT)
                        return null;
                    }
                })
            );

            const desired = (input.lang ?? 'en').toLowerCase();
            const items = itemsRaw
                .filter((v): v is Exclude<typeof v, null> => v !== null)
                .filter((v) => {
                    // Language filter
                    if (desired === 'fr') {
                        if ((v.lang ?? '').toLowerCase() !== 'fr') return false;
                    } else {
                        // default 'en': include english or missing lang
                        if ((v.lang?.toLowerCase() ?? 'en') !== 'en') return false;
                    }

                    // Domain filter
                    if (input.domains && input.domains.length > 0) {
                        if (!v.domain || !input.domains.includes(v.domain)) return false;
                    }

                    // Authors filter
                    if (input.authors && input.authors.length > 0) {
                        if (!v.authors || !input.authors.includes(v.authors)) return false;
                    }

                    // Tags filter (blog must have at least one of the selected tags)
                    if (input.tags && input.tags.length > 0) {
                        if (!v.tags || !v.tags.some(tag => input.tags!.includes(tag))) return false;
                    }

                    return true;
                });
            return items;
        }),
});

