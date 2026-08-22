import { getDb } from "./db";
import { blogPosts } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  date: string;
  read_time: number;
  featured: boolean;
}

async function insertPosts() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, "../../generate_blog_posts.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const { results } = JSON.parse(rawData);

  const newPosts: BlogPostData[] = results.map((item: any) => ({
    title: item.output.title,
    slug: item.output.slug,
    excerpt: item.output.excerpt,
    content: item.output.content,
    category: item.output.category,
    tags: item.output.tags,
    date: item.output.date,
    read_time: item.output.read_time,
    featured: item.output.featured,
  }));

  try {
    console.log(`Inserting ${newPosts.length} new blog posts...`);
    for (const post of newPosts) {
      await db.insert(blogPosts).values({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: JSON.stringify(post.tags.split(',').map((tag: string) => tag.trim())),
        imageUrl: "/manus-storage/default-blog-image.png",
        date: post.date,
        readTime: String(post.read_time),
        featured: Boolean(post.featured),
      });
    }
    console.log("Successfully inserted new blog posts.");
  } catch (error) {
    console.error("Error inserting new blog posts:", error);
  }
}

insertPosts();
