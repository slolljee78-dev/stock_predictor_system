import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { getPortfolioTemplates, createPortfolioTemplate } from '../db';

/**
 * Portfolio Templates Router
 * Handles pre-built and custom portfolio templates
 */
export const templatesRouter = router({
  /**
   * Get all available portfolio templates
   */
  getTemplates: publicProcedure
    .input(z.object({
      category: z.enum(['TECH_GROWTH', 'DIVIDEND_INCOME', 'BALANCED', 'CUSTOM']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      try {
        const templates = await getPortfolioTemplates(undefined);
        const filtered = input.category
          ? templates?.filter(t => t.category === input.category)
          : templates;
        return {
          templates: filtered?.slice(input.offset, input.offset + input.limit) || [],
          totalCount: filtered?.length || 0,
        };
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        throw new Error('Failed to fetch templates');
      }
    }),

  /**
   * Get single template by ID
   */
  getTemplate: publicProcedure
    .input(z.object({
      templateId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const templates = await getPortfolioTemplates(undefined);
        const template = templates?.find(t => t.id === input.templateId);
        if (!template) throw new Error('Template not found');
        return template;
      } catch (error) {
        console.error('Failed to fetch template:', error);
        throw new Error('Failed to fetch template');
      }
    }),

  /**
   * Create new portfolio from template
   */
  createPortfolioFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      portfolioName: z.string(),
      investmentAmount: z.number().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Create portfolio with template holdings
        return {
          success: true,
          portfolioId: Date.now(),
          createdAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to create portfolio from template:', error);
        throw new Error('Failed to create portfolio from template');
      }
    }),

  /**
   * Get user's custom templates
   */
  getUserTemplates: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const templates = await getPortfolioTemplates(ctx.user.id);
        const userTemplates = templates?.filter(t => t.userId === ctx.user.id) || [];
        return {
          templates: userTemplates.slice(input.offset, input.offset + input.limit),
          totalCount: userTemplates.length,
        };
      } catch (error) {
        console.error('Failed to fetch user templates:', error);
        throw new Error('Failed to fetch user templates');
      }
    }),

  /**
   * Create custom portfolio template
   */
  createTemplate: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      category: z.enum(['TECH_GROWTH', 'DIVIDEND_INCOME', 'BALANCED', 'CUSTOM']),
      holdings: z.record(z.string(), z.number()),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await createPortfolioTemplate(
          ctx.user.id,
          input.name,
          JSON.stringify(input.holdings),
          input.category,
          input.description,
          input.isPublic
        );
        return {
          success: true,
          templateId: Date.now(),
          createdAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to create template:', error);
        throw new Error('Failed to create template');
      }
    }),

  /**
   * Update custom template
   */
  updateTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      holdings: z.record(z.string(), z.number()).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Update template in database
        return {
          success: true,
          updatedAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to update template:', error);
        throw new Error('Failed to update template');
      }
    }),

  /**
   * Delete custom template
   */
  deleteTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Delete template from database
        return {
          success: true,
        };
      } catch (error) {
        console.error('Failed to delete template:', error);
        throw new Error('Failed to delete template');
      }
    }),

  /**
   * Get template usage statistics
   */
  getTemplateStats: publicProcedure
    .input(z.object({
      templateId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        // TODO: Fetch template usage stats from database
        return {
          templateId: input.templateId,
          timesUsed: 0,
          averageReturn: 0,
          averageRisk: 0,
          lastUsedAt: null,
        };
      } catch (error) {
        console.error('Failed to fetch template stats:', error);
        throw new Error('Failed to fetch template stats');
      }
    }),

  /**
   * Clone existing template
   */
  cloneTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      newName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Clone template for user
        return {
          success: true,
          newTemplateId: Date.now(),
          createdAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to clone template:', error);
        throw new Error('Failed to clone template');
      }
    }),

  /**
   * Export template as JSON
   */
  exportTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Export template data
        return {
          success: true,
          data: {},
          exportedAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to export template:', error);
        throw new Error('Failed to export template');
      }
    }),

  /**
   * Import template from JSON
   */
  importTemplate: protectedProcedure
    .input(z.object({
      templateData: z.record(z.string(), z.any()),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Import and validate template data
        return {
          success: true,
          templateId: Date.now(),
          createdAt: new Date(),
        };
      } catch (error) {
        console.error('Failed to import template:', error);
        throw new Error('Failed to import template');
      }
    }),
});
