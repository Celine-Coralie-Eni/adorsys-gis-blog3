import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@blog/server/api/trpc";
import { getAllBlogMeta } from "@blog/server/blog/api";

export const postRouter = createTRPCRouter({
  filtered: publicProcedure
    .input(
      z.object({
        domains: z.array(z.string()).optional(),
        authors: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        lang: z.enum(["en", "fr"]).optional(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { domains, authors, tags, lang, limit, cursor } = input;

      // Get all blog metadata
      const allBlogs = await getAllBlogMeta();

      // Apply filters
      const filtered = allBlogs.filter((blog) => {
        // Language filter
        if (lang && blog.lang !== lang) {
          return false;
        }

        // Domain filter
        if (domains && domains.length > 0) {
          if (!blog.domain || !domains.includes(blog.domain)) {
            return false;
          }
        }

        // Author filter
        if (authors && authors.length > 0) {
          if (!blog.author || !authors.includes(blog.author)) {
            return false;
          }
        }

        // Tag filter
        if (tags && tags.length > 0) {
          if (!blog.tags || !blog.tags.some((tag) => tags.includes(tag))) {
            return false;
          }
        }

        return true;
      });

      // Paginate results
      const paginatedBlogs = filtered.slice(cursor, cursor + limit);
      const nextCursor = cursor + paginatedBlogs.length < filtered.length
        ? cursor + limit
        : null;

      return {
        blogs: paginatedBlogs,
        nextCursor,
        total: filtered.length,
      };
    }),
});
