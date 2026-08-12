import React, { useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Streamdown } from 'streamdown';
import { trpc } from '@/lib/trpc';
import { BlogPost as BlogPostType } from '@/lib/blogData';
import { Helmet } from 'react-helmet-async';

export default function BlogPost() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/blog/:slug');

  // Fetch all blog posts
  const { data: allPosts = [], isLoading } = trpc.blog.getBlogPosts.useQuery();

  // Find the current post by slug
  const post = useMemo(() => {
    if (!params?.slug || !allPosts.length) return undefined;
    return allPosts.find((p: BlogPostType) => p.slug === params.slug);
  }, [params?.slug, allPosts]);

  // Get related posts by tag
  const relatedPosts = useMemo(() => {
    if (!post || !allPosts.length) return [];
    const firstTag = post.tags[0];
    return allPosts
      .filter((p: BlogPostType) => p.tags.includes(firstTag) && p.id !== post.id)
      .slice(0, 3);
  }, [post, allPosts]);

  if (!match || !params?.slug) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <Button onClick={() => setLocation('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <Button onClick={() => setLocation('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out this article: ${post.title}`;

    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: text,
        url: url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const canonicalUrl = `https://vortextrade.manus.space/blog/${post.slug}`;
  const quickAnswer = post.excerpt || post.content?.slice(0, 200);

  return (
    <>
    <Helmet>
      <title>{post.title} | Vortextrade Blog</title>
      <meta name="description" content={post.excerpt || post.title} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt || post.title} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="article" />
      <link rel="canonical" href={canonicalUrl} />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt || post.title,
        "author": { "@type": "Person", "name": post.author },
        "datePublished": post.date,
        "publisher": { "@type": "Organization", "name": "Vortextrade", "url": "https://vortextrade.manus.space" },
        "url": canonicalUrl,
      })}</script>
    </Helmet>
    <div className="min-h-screen bg-background p-4 md:p-8 page-enter">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={() => setLocation('/blog')}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors hover:bg-slate-700 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </button>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {post.category.replace('-', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime} min read
            </span>
          </div>

          <h1 className="text-4xl font-bold gradient-text">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </div>
            <span>By {post.author}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setLocation(`/blog?tag=${encodeURIComponent(tag)}`)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Quick Answer box — optimised for Google featured snippets */}
        {quickAnswer && (
          <Card className="border border-cyan-500/25 bg-cyan-500/5">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Quick Answer</p>
              <p className="text-slate-300 text-sm leading-relaxed">{quickAnswer}</p>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        <Card className="premium-card border-0 bg-transparent shadow-none">
          <CardContent className="pt-0">
            <div className="prose prose-invert max-w-none space-y-4">
              <Streamdown>{post.content}</Streamdown>
            </div>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Author Info */}
        <Card className="premium-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="font-semibold">About the Author</p>
              <p className="text-sm text-muted-foreground">
                {post.author} is part of the Vortextrade team dedicated to helping traders learn technical analysis and improve their trading strategies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Related Articles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPosts.map((relatedPost: BlogPostType) => (
                <Card
                  key={relatedPost.id}
                  className="premium-card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setLocation(`/blog/${relatedPost.slug}`)}
                >
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-semibold line-clamp-2">{relatedPost.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatDate(relatedPost.date)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {relatedPost.readTime} min
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-4">
          <h3 className="text-xl font-semibold">Ready to start trading?</h3>
          <p className="text-muted-foreground">
            Use Vortextrade to get AI-powered trading signals and practice with our paper trading simulator.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setLocation('/signals')}
              className="pill-button pill-button-primary"
            >
              View Signals
            </Button>
            <Button
              onClick={() => setLocation('/simulator')}
              variant="outline"
              className="pill-button"
            >
              Try Simulator
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
