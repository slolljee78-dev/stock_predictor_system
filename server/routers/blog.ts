import { publicProcedure, router } from "../_core/trpc";
import { z } from 'zod';
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const blogRouter = router({
  getBlogPosts: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const posts = await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
    return posts.map(p => ({ ...p, tags: (p.tags as string[]) ?? [] }));
  }),

  getBlogPostBySlug: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      const post = await db.select().from(blogPosts).where(eq(blogPosts.slug, input)).limit(1);
      if (!post[0]) return undefined;
      return { ...post[0], tags: (post[0].tags as string[]) ?? [] };
    }),
});
