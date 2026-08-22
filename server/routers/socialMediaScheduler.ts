/**
 * Social Media Scheduler Router
 * Handles scheduling and management of Reddit and Twitter posts
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import {
  socialMediaPosts,
  socialMediaTemplates,
  socialMediaAccounts,
  socialMediaAnalytics,
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const socialMediaSchedulerRouter = router({
  /**
   * Schedule a new social media post
   */
  schedulePost: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['reddit', 'twitter']),
        title: z.string().optional(),
        content: z.string().min(1).max(10000),
        subreddit: z.string().optional(),
        tags: z.array(z.string()).optional(),
        scheduledAt: z.number(), // Unix timestamp
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const result = await db.insert(socialMediaPosts).values({
        userId: ctx.user.id,
        platform: input.platform,
        title: input.title,
        content: input.content,
        subreddit: input.subreddit,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        scheduledAt: new Date(input.scheduledAt),
        status: 'scheduled',
      });

      return {
        id: result[0].insertId,
        message: 'Post scheduled successfully',
      };
    }),

  /**
   * Get all scheduled posts for user
   */
  getScheduledPosts: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['reddit', 'twitter']).optional(),
        status: z.enum(['scheduled', 'posted', 'failed', 'draft']).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      let query: any = db
        .select()
        .from(socialMediaPosts)
        .where(eq(socialMediaPosts.userId, ctx.user.id));

      if (input.platform) {
        query = query.where(eq(socialMediaPosts.platform, input.platform));
      }

      if (input.status) {
        query = query.where(eq(socialMediaPosts.status, input.status));
      }

      const posts = await query.limit(input.limit).offset(input.offset);

      return posts.map((post: any) => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      }));
    }),

  /**
   * Update a scheduled post
   */
  updatePost: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.string().optional(),
        title: z.string().optional(),
        scheduledAt: z.number().optional(),
        status: z.enum(['scheduled', 'draft']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const post = await db
        .select()
        .from(socialMediaPosts)
        .where(and(eq(socialMediaPosts.id, input.id), eq(socialMediaPosts.userId, ctx.user.id)))
        .limit(1);

      if (!post.length) {
        throw new Error('Post not found');
      }

      const updateData: any = {};
      if (input.content) updateData.content = input.content;
      if (input.title) updateData.title = input.title;
      if (input.scheduledAt) updateData.scheduledAt = new Date(input.scheduledAt);
      if (input.status) updateData.status = input.status;

      await db
        .update(socialMediaPosts)
        .set(updateData)
        .where(eq(socialMediaPosts.id, input.id));

      return { message: 'Post updated successfully' };
    }),

  /**
   * Delete a scheduled post
   */
  deletePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const post = await db
        .select()
        .from(socialMediaPosts)
        .where(and(eq(socialMediaPosts.id, input.id), eq(socialMediaPosts.userId, ctx.user.id)))
        .limit(1);

      if (!post.length) {
        throw new Error('Post not found');
      }

      await db.delete(socialMediaPosts).where(eq(socialMediaPosts.id, input.id));

      return { message: 'Post deleted successfully' };
    }),

  /**
   * Create a reusable template
   */
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        platform: z.enum(['reddit', 'twitter']),
        category: z.string(),
        template: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const result = await db.insert(socialMediaTemplates).values({
        userId: ctx.user.id,
        name: input.name,
        platform: input.platform,
        category: input.category,
        template: input.template,
        description: input.description,
        isPublic: input.isPublic,
      });

      return {
        id: result[0].insertId,
        message: 'Template created successfully',
      };
    }),

  /**
   * Get all templates for user
   */
  getTemplates: protectedProcedure
    .input(
      z.object({
        platform: z.enum(['reddit', 'twitter']).optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      let query: any = db
        .select()
        .from(socialMediaTemplates)
        .where(eq(socialMediaTemplates.userId, ctx.user.id));

      if (input.platform) {
        query = query.where(eq(socialMediaTemplates.platform, input.platform));
      }

      if (input.category) {
        query = query.where(eq(socialMediaTemplates.category, input.category));
      }

      return await query;
    }),

  /**
   * Get post analytics
   */
  getPostAnalytics: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const post = await db
        .select()
        .from(socialMediaPosts)
        .where(and(eq(socialMediaPosts.id, input.postId), eq(socialMediaPosts.userId, ctx.user.id)))
        .limit(1);

      if (!post.length) {
        throw new Error('Post not found');
      }

      const analytics = await db
        .select()
        .from(socialMediaAnalytics)
        .where(eq(socialMediaAnalytics.postId, input.postId));

      return {
        post: post[0],
        analytics: analytics[0] || null,
      };
    }),

  /**
   * Get dashboard statistics
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const posts = await db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.userId, ctx.user.id));

    const totalPosts = posts.length;
    const postedCount = posts.filter(p => p.status === 'posted').length;
    const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
    const failedCount = posts.filter(p => p.status === 'failed').length;

    const totalEngagement = posts.reduce((sum, p) => sum + (p.engagement || 0), 0);
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

    const redditPosts = posts.filter(p => p.platform === 'reddit').length;
    const twitterPosts = posts.filter(p => p.platform === 'twitter').length;

    return {
      totalPosts,
      postedCount,
      scheduledCount,
      failedCount,
      totalEngagement,
      totalViews,
      redditPosts,
      twitterPosts,
      avgEngagement: totalPosts > 0 ? totalEngagement / totalPosts : 0,
    };
  }),

  /**
   * Get content templates by category
   */
  getTemplatesByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      return await db
        .select()
        .from(socialMediaTemplates)
        .where(
          and(
            eq(socialMediaTemplates.userId, ctx.user.id),
            eq(socialMediaTemplates.category, input.category)
          )
        );
    }),

  /**
   * Create post from template
   */
  createPostFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        variables: z.record(z.string(), z.any()).optional(),
        scheduledAt: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const template = await db
        .select()
        .from(socialMediaTemplates)
        .where(eq(socialMediaTemplates.id, input.templateId))
        .limit(1);

      if (!template.length) {
        throw new Error('Template not found');
      }

      let content = template[0].template;

      // Replace variables in template
      if (input.variables) {
        Object.entries(input.variables).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
      }

      const result = await db.insert(socialMediaPosts).values({
        userId: ctx.user.id,
        platform: template[0].platform,
        content,
        title: template[0].name,
        scheduledAt: new Date(input.scheduledAt),
        status: 'scheduled',
      });

      return {
        id: result[0].insertId,
        message: 'Post created from template successfully',
      };
    }),
});
