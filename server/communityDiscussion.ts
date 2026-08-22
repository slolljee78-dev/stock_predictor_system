/**
 * Community Discussion & Comment System
 * Enables users to discuss blog posts, trading signals, and strategies
 */

export interface Comment {
  id: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies: Comment[];
  parentCommentId?: string;
  isEdited: boolean;
  isPinned: boolean;
  isModerated: boolean;
}

export interface Discussion {
  id: string;
  type: 'blog-post' | 'trading-signal' | 'strategy';
  targetId: string; // blog post slug, signal ID, or strategy ID
  title: string;
  description?: string;
  comments: Comment[];
  totalComments: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface DiscussionStats {
  totalComments: number;
  totalReplies: number;
  mostLikedComment: Comment | null;
  averageLikesPerComment: number;
  activeParticipants: number;
  lastActivityAt: Date;
}

/**
 * Validate comment content
 */
export function validateComment(content: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Comment cannot be empty' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Comment must be at least 3 characters' };
  }

  if (trimmed.length > 5000) {
    return { isValid: false, error: 'Comment cannot exceed 5000 characters' };
  }

  return { isValid: true };
}

/**
 * Detect spam or inappropriate content
 */
export function detectInappropriateContent(content: string): {
  isInappropriate: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
} {
  const lowerContent = content.toLowerCase();

  // Spam patterns
  const spamPatterns = [
    /(?:http|https):\/\/[^\s]+/g, // URLs
    /\b(?:bitcoin|crypto|forex|casino|lottery)\b/gi, // Spam keywords
    /(?:click here|buy now|limited offer)\b/gi, // Spam phrases
  ];

  let spamScore = 0;
  let urlCount = 0;
  spamPatterns.forEach(pattern => {
    const matches = content.match(pattern) || [];
    spamScore += matches.length;
    if (pattern.source.includes("http")) urlCount += matches.length;
  });

  if (urlCount > 0 || spamScore > 2) {
    return {
      isInappropriate: true,
      reason: 'Potential spam detected',
      severity: 'high',
    };
  }

  // Profanity patterns (simplified)
  const profanityPatterns = [/\b(?:badword1|badword2)\b/gi];

  for (const pattern of profanityPatterns) {
    if (pattern.test(content)) {
      return {
        isInappropriate: true,
        reason: 'Inappropriate language detected',
        severity: 'medium',
      };
    }
  }

  // Excessive caps
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5) {
    return {
      isInappropriate: false,
      reason: 'Excessive capitalization',
      severity: 'low',
    };
  }

  return { isInappropriate: false, severity: 'low' };
}

/**
 * Format comment for display
 */
export function formatCommentForDisplay(comment: Comment): {
  content: string;
  displayName: string;
  timeAgo: string;
} {
  // Simple time formatting
  const now = new Date();
  const diff = now.getTime() - comment.createdAt.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let timeAgo = '';
  if (minutes < 1) {
    timeAgo = 'just now';
  } else if (minutes < 60) {
    timeAgo = `${minutes}m ago`;
  } else if (hours < 24) {
    timeAgo = `${hours}h ago`;
  } else if (days < 7) {
    timeAgo = `${days}d ago`;
  } else {
    timeAgo = comment.createdAt.toLocaleDateString();
  }

  // Sanitize and format content (simplified)
  const sanitized = comment.content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  return {
    content: sanitized,
    displayName: comment.userName,
    timeAgo,
  };
}

/**
 * Calculate discussion statistics
 */
export function calculateDiscussionStats(discussion: Discussion): DiscussionStats {
  let totalReplies = 0;
  let totalLikes = 0;
  let mostLikedComment: Comment | null = null;
  const uniqueParticipants = new Set<number>();
  let lastActivityAt = discussion.createdAt;

  const processComments = (comments: Comment[]) => {
    comments.forEach(comment => {
      totalLikes += comment.likes;
      uniqueParticipants.add(comment.userId);

      if (!mostLikedComment || comment.likes > mostLikedComment.likes) {
        mostLikedComment = comment;
      }

      if (comment.updatedAt > lastActivityAt) {
        lastActivityAt = comment.updatedAt;
      }

      if (comment.replies && comment.replies.length > 0) {
        totalReplies += comment.replies.length;
        processComments(comment.replies);
      }
    });
  };

  processComments(discussion.comments);

  const avgLikes =
    discussion.totalComments > 0 ? totalLikes / discussion.totalComments : 0;

  return {
    totalComments: discussion.totalComments,
    totalReplies,
    mostLikedComment,
    averageLikesPerComment: avgLikes,
    activeParticipants: uniqueParticipants.size,
    lastActivityAt,
  };
}

/**
 * Get top comments by likes
 */
export function getTopComments(
  discussion: Discussion,
  limit: number = 5
): Comment[] {
  const allComments: Comment[] = [];

  const collectComments = (comments: Comment[]) => {
    comments.forEach(comment => {
      allComments.push(comment);
      if (comment.replies && comment.replies.length > 0) {
        collectComments(comment.replies);
      }
    });
  };

  collectComments(discussion.comments);

  return allComments
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit);
}

/**
 * Get recent comments
 */
export function getRecentComments(
  discussion: Discussion,
  limit: number = 10
): Comment[] {
  const allComments: Comment[] = [];

  const collectComments = (comments: Comment[]) => {
    comments.forEach(comment => {
      allComments.push(comment);
      if (comment.replies && comment.replies.length > 0) {
        collectComments(comment.replies);
      }
    });
  };

  collectComments(discussion.comments);

  return allComments
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

/**
 * Search comments by keyword
 */
export function searchComments(
  discussion: Discussion,
  keyword: string
): Comment[] {
  const lowerKeyword = keyword.toLowerCase();
  const results: Comment[] = [];

  const searchInComments = (comments: Comment[]) => {
    comments.forEach(comment => {
      if (comment.content.toLowerCase().includes(lowerKeyword)) {
        results.push(comment);
      }

      if (comment.replies && comment.replies.length > 0) {
        searchInComments(comment.replies);
      }
    });
  };

  searchInComments(discussion.comments);

  return results;
}

/**
 * Generate discussion summary
 */
export interface DiscussionSummary {
  title: string;
  description: string;
  topicCount: number;
  participantCount: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  keyPoints: string[];
}

export function generateDiscussionSummary(discussion: Discussion): DiscussionSummary {
  const stats = calculateDiscussionStats(discussion);
  const topComments = getTopComments(discussion, 3);

  // Analyze sentiment (simplified)
  const positiveKeywords = ['good', 'great', 'excellent', 'bullish', 'profit'];
  const negativeKeywords = ['bad', 'poor', 'bearish', 'loss', 'concern'];

  let positiveCount = 0;
  let negativeCount = 0;

  const allComments: Comment[] = [];
  const collectComments = (comments: Comment[]) => {
    comments.forEach(comment => {
      allComments.push(comment);
      if (comment.replies) {
        collectComments(comment.replies);
      }
    });
  };

  collectComments(discussion.comments);

  allComments.forEach(comment => {
    const lower = comment.content.toLowerCase();
    positiveKeywords.forEach(keyword => {
      if (lower.includes(keyword)) positiveCount++;
    });
    negativeKeywords.forEach(keyword => {
      if (lower.includes(keyword)) negativeCount++;
    });
  });

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount + 2) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount + 2) {
    sentiment = 'negative';
  }

  // Extract key points from top comments
  const keyPoints = topComments
    .map(comment => {
      const sentences = comment.content.split(/[.!?]+/);
      return sentences[0].trim();
    })
    .filter(point => point.length > 10)
    .slice(0, 3);

  return {
    title: discussion.title,
    description: discussion.description || '',
    topicCount: discussion.totalComments,
    participantCount: stats.activeParticipants,
    sentiment,
    keyPoints,
  };
}

/**
 * Moderate discussion
 */
export interface ModerationAction {
  type: 'remove' | 'flag' | 'hide' | 'approve';
  reason: string;
  actionedBy: number; // user ID
  actionedAt: Date;
}

export function shouldAutoModerate(comment: Comment): {
  shouldModerate: boolean;
  reason?: string;
} {
  const inappropriate = detectInappropriateContent(comment.content);

  if (inappropriate.isInappropriate) {
    return {
      shouldModerate: true,
      reason: inappropriate.reason,
    };
  }

  // Check for excessive length
  if (comment.content.length > 3000) {
    return {
      shouldModerate: true,
      reason: 'Comment exceeds recommended length',
    };
  }

  return { shouldModerate: false };
}

/**
 * Create discussion thread
 */
export function createDiscussionThread(
  type: 'blog-post' | 'trading-signal' | 'strategy',
  targetId: string,
  title: string,
  description?: string
): Discussion {
  return {
    id: `disc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    targetId,
    title,
    description,
    comments: [],
    totalComments: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };
}
