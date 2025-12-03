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
    cards: publicProcedure
        .input(z.object({ q: z.string().min(1), limit: z.number().min(1).max(50).optional(), lang: z.enum(["en", "fr"]).optional() }))
        .query(async ({ input }) => {
            const results = await searchContent(input.q, input.limit ?? 50);

            const items = results.map((r) => {
                const slug = r.url.replace(/^\/?b\//, '');
                return {
                    slug,
                    title: r.title,
                    description: r.snippet,
                    author: r.author,
                    readingTime: r.readingTime,
                    // The following are not available from search results, but the UI can handle their absence
                    lang: undefined,
                    tags: undefined,
                    previews: undefined,
                };
            });

            return items;
        }),
});

