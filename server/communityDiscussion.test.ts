import { describe, it, expect } from 'vitest';
import {
  validateComment,
  detectInappropriateContent,
  formatCommentForDisplay,
  calculateDiscussionStats,
  getTopComments,
  getRecentComments,
  searchComments,
  generateDiscussionSummary,
  shouldAutoModerate,
  createDiscussionThread,
  Comment,
  Discussion,
} from './communityDiscussion';

describe('Community Discussion System', () => {
  const mockComment: Comment = {
    id: '1',
    userId: 1,
    userName: 'John Doe',
    userAvatar: 'https://example.com/avatar.jpg',
    content: 'This is a great trading signal!',
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: 5,
    replies: [],
    isEdited: false,
    isPinned: false,
    isModerated: false,
  };

  const mockDiscussion: Discussion = {
    id: '1',
    type: 'blog-post',
    targetId: 'blog-1',
    title: 'Trading Signals Discussion',
    description: 'Discuss the latest trading signals',
    comments: [mockComment],
    totalComments: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };

  describe('validateComment', () => {
    it('should accept valid comments', () => {
      const result = validateComment('This is a valid comment');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty comments', () => {
      const result = validateComment('   ');

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject comments that are too short', () => {
      const result = validateComment('ab');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should reject comments that are too long', () => {
      const longComment = 'a'.repeat(5001);
      const result = validateComment(longComment);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed 5000 characters');
    });

    it('should accept comments at boundary lengths', () => {
      const minComment = 'abc';
      const maxComment = 'a'.repeat(5000);

      expect(validateComment(minComment).isValid).toBe(true);
      expect(validateComment(maxComment).isValid).toBe(true);
    });
  });

  describe('detectInappropriateContent', () => {
    it('should detect spam URLs', () => {
      const result = detectInappropriateContent(
        'Check out http://spam.com and https://scam.com for great deals'
      );

      expect(result.isInappropriate).toBe(true);
      expect(result.severity).toBe('high');
    });

    it('should detect spam keywords', () => {
      const result = detectInappropriateContent(
        'Buy bitcoin now! Limited offer on crypto trading'
      );

      expect(result.isInappropriate).toBe(true);
    });

    it('should allow legitimate content', () => {
      const result = detectInappropriateContent(
        'I think this trading signal is very good for long-term growth'
      );

      expect(result.isInappropriate).toBe(false);
    });

    it('should detect excessive capitalization', () => {
      const result = detectInappropriateContent('THIS IS REALLY IMPORTANT!!!');

      expect(result.severity).toMatch(/low|medium|high/);
    });
  });

  describe('formatCommentForDisplay', () => {
    it('should format recent comments', () => {
      const recentComment: Comment = {
        ...mockComment,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      };

      const formatted = formatCommentForDisplay(recentComment);

      expect(formatted.timeAgo).toContain('m ago');
      expect(formatted.displayName).toBe('John Doe');
    });

    it('should format old comments', () => {
      const oldComment: Comment = {
        ...mockComment,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      };

      const formatted = formatCommentForDisplay(oldComment);

      expect(formatted.timeAgo).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should sanitize HTML content', () => {
      const htmlComment: Comment = {
        ...mockComment,
        content: '<script>alert("xss")</script>',
      };

      const formatted = formatCommentForDisplay(htmlComment);

      expect(formatted.content).not.toContain('<script>');
      expect(formatted.content).toContain('&lt;script&gt;');
    });

    it('should format line breaks', () => {
      const multilineComment: Comment = {
        ...mockComment,
        content: 'Line 1\nLine 2\nLine 3',
      };

      const formatted = formatCommentForDisplay(multilineComment);

      expect(formatted.content).toContain('<br>');
    });
  });

  describe('calculateDiscussionStats', () => {
    it('should calculate basic stats', () => {
      const stats = calculateDiscussionStats(mockDiscussion);

      expect(stats.totalComments).toBe(1);
      expect(stats.activeParticipants).toBe(1);
      expect(stats.mostLikedComment).toBe(mockComment);
    });

    it('should calculate average likes', () => {
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: [
          { ...mockComment, likes: 10 },
          { ...mockComment, id: '2', likes: 20 },
          { ...mockComment, id: '3', likes: 30 },
        ],
        totalComments: 3,
      };

      const stats = calculateDiscussionStats(discussion);

      expect(stats.averageLikesPerComment).toBe(20);
    });

    it('should count replies', () => {
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: [
          {
            ...mockComment,
            replies: [
              { ...mockComment, id: '2', parentCommentId: '1' },
              { ...mockComment, id: '3', parentCommentId: '1' },
            ],
          },
        ],
        totalComments: 3,
      };

      const stats = calculateDiscussionStats(discussion);

      expect(stats.totalReplies).toBe(2);
    });
  });

  describe('getTopComments', () => {
    it('should return top comments by likes', () => {
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: [
          { ...mockComment, id: '1', likes: 5 },
          { ...mockComment, id: '2', likes: 20 },
          { ...mockComment, id: '3', likes: 10 },
        ],
        totalComments: 3,
      };

      const topComments = getTopComments(discussion, 2);

      expect(topComments).toHaveLength(2);
      expect(topComments[0].likes).toBe(20);
      expect(topComments[1].likes).toBe(10);
    });

    it('should respect limit parameter', () => {
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: Array.from({ length: 10 }, (_, i) => ({
          ...mockComment,
          id: `${i}`,
          likes: i,
        })),
        totalComments: 10,
      };

      const topComments = getTopComments(discussion, 3);

      expect(topComments).toHaveLength(3);
    });
  });

  describe('getRecentComments', () => {
    it('should return recent comments', () => {
      const now = new Date();
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: [
          { ...mockComment, id: '1', updatedAt: new Date(now.getTime() - 1000) },
          { ...mockComment, id: '2', updatedAt: new Date(now.getTime() - 2000) },
          { ...mockComment, id: '3', updatedAt: new Date(now.getTime() - 3000) },
        ],
        totalComments: 3,
      };

      const recentComments = getRecentComments(discussion, 2);

      expect(recentComments).toHaveLength(2);
      expect(recentComments[0].id).toBe('1');
    });
  });

  describe('searchComments', () => {
    it('should find comments by keyword', () => {
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: [
          { ...mockComment, id: '1', content: 'Great trading signal' },
          { ...mockComment, id: '2', content: 'Bad signal' },
          { ...mockComment, id: '3', content: 'Excellent analysis' },
        ],
        totalComments: 3,
      };

      const results = searchComments(discussion, 'great');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('should be case-insensitive', () => {
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: [{ ...mockComment, content: 'GREAT Signal' }],
        totalComments: 1,
      };

      const results = searchComments(discussion, 'great');

      expect(results).toHaveLength(1);
    });
  });

  describe('generateDiscussionSummary', () => {
    it('should generate summary with sentiment', () => {
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: [
          { ...mockComment, id: '1', content: 'Great signal, very bullish' },
          { ...mockComment, id: '2', content: 'Excellent profit opportunity' },
        ],
        totalComments: 2,
      };

      const summary = generateDiscussionSummary(discussion);

      expect(summary.title).toBe(mockDiscussion.title);
      expect(summary.sentiment).toBe('positive');
      expect(summary.keyPoints.length).toBeGreaterThan(0);
    });

    it('should detect negative sentiment', () => {
      const discussion: Discussion = {
        ...mockDiscussion,
        comments: [
          { ...mockComment, id: '1', content: 'Bad signal, concerned about loss' },
          { ...mockComment, id: '2', content: 'Poor analysis, bearish outlook' },
        ],
        totalComments: 2,
      };

      const summary = generateDiscussionSummary(discussion);

      expect(summary.sentiment).toBe('negative');
    });
  });

  describe('shouldAutoModerate', () => {
    it('should flag inappropriate content', () => {
      const inappropriateComment: Comment = {
        ...mockComment,
        content: 'Check out http://spam.com for crypto deals',
      };

      const result = shouldAutoModerate(inappropriateComment);

      expect(result.shouldModerate).toBe(true);
    });

    it('should allow appropriate content', () => {
      const result = shouldAutoModerate(mockComment);

      expect(result.shouldModerate).toBe(false);
    });

    it('should flag excessively long comments', () => {
      const longComment: Comment = {
        ...mockComment,
        content: 'a'.repeat(3001),
      };

      const result = shouldAutoModerate(longComment);

      expect(result.shouldModerate).toBe(true);
    });
  });

  describe('createDiscussionThread', () => {
    it('should create discussion thread', () => {
      const discussion = createDiscussionThread(
        'blog-post',
        'blog-123',
        'Trading Signals Discussion'
      );

      expect(discussion.type).toBe('blog-post');
      expect(discussion.targetId).toBe('blog-123');
      expect(discussion.title).toBe('Trading Signals Discussion');
      expect(discussion.isActive).toBe(true);
      expect(discussion.comments).toHaveLength(0);
    });

    it('should generate unique IDs', () => {
      const disc1 = createDiscussionThread('blog-post', 'blog-1', 'Title 1');
      const disc2 = createDiscussionThread('blog-post', 'blog-2', 'Title 2');

      expect(disc1.id).not.toBe(disc2.id);
    });

    it('should support different discussion types', () => {
      const types: Array<'blog-post' | 'trading-signal' | 'strategy'> = [
        'blog-post',
        'trading-signal',
        'strategy',
      ];

      types.forEach(type => {
        const discussion = createDiscussionThread(type, 'target-1', 'Title');
        expect(discussion.type).toBe(type);
      });
    });
  });
});
