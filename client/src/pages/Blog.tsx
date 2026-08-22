import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Clock, Tag, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { BlogPost } from '@/lib/blogData';

export default function Blog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: blogPosts = [], isLoading } = trpc.blog.getBlogPosts.useQuery();

  // Filter posts based on search, category, and tag
  let filteredPosts = blogPosts.filter((post: BlogPost) => {
    const matchesSearch = searchQuery
      ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = selectedCategory
      ? post.category === selectedCategory
      : true;
    const matchesTag = selectedTag
      ? post.tags.includes(selectedTag)
      : true;
    return matchesSearch && matchesCategory && matchesTag;
  });

  if (searchQuery) {
    filteredPosts = filteredPosts.filter(
      post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedCategory) {
    filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
  }

  if (selectedTag) {
    filteredPosts = filteredPosts.filter(post => post.tags.includes(selectedTag));
  }

  // Sort by date (newest first)
  filteredPosts = filteredPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const categories = Array.from(new Set(blogPosts.map((post: BlogPost) => post.category)));
  const tags = Array.from(new Set(blogPosts.flatMap((post: BlogPost) => post.tags)));
  const featuredPosts = blogPosts.filter((post: BlogPost) => post.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const BlogCard = ({ post }: { post: BlogPost }) => (
    <Card className="premium-card hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={() => setLocation(`/blog/${post.slug}`)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="capitalize">
            {post.category.replace('-', ' ')}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readTime} min
          </span>
        </div>
        <CardTitle className="text-lg">{post.title}</CardTitle>
        <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(post.date)}
          </div>
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" className="w-full mt-4 justify-between" asChild>
          <span>
            Read More
            <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 page-enter">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Vortextrade Blog</h1>
          <p className="text-lg text-muted-foreground">
            Learn trading strategies, technical analysis, and how to use Vortextrade to improve your trading
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Filter by category:</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {selectedTag && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Filtering by tag: <span className="text-primary">{selectedTag}</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                Clear tag filter
              </Button>
            </div>
          )}
        </div>

        {/* Featured Posts (only show when no filters applied) */}
        {!isLoading && !searchQuery && !selectedCategory && !selectedTag && featuredPosts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Featured Articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {searchQuery || selectedCategory || selectedTag ? 'Search Results' : 'All Articles'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredPosts.length} article${filteredPosts.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="premium-card">
              <CardContent className="pt-8 text-center">
                <p className="text-muted-foreground">No articles found. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Browse by Tag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4 pt-8">
          <p className="text-muted-foreground">
            Want to learn more? Check out our Getting Started guide or video tutorials.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setLocation('/getting-started')}
              className="pill-button pill-button-primary"
            >
              Getting Started Guide
            </Button>
            <Button
              onClick={() => setLocation('/signals')}
              variant="outline"
              className="pill-button"
            >
              View Signals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
