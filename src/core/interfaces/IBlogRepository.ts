import type { BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from "../entities/Blog"

export interface IBlogRepository {
  getAllPosts(): Promise<BlogPost[]>
  getPublishedPosts(): Promise<BlogPost[]>
  getPostBySlug(slug: string): Promise<BlogPost | null>
  getPopularPosts(limit?: number): Promise<BlogPost[]>
  createPost(input: CreateBlogPostInput): Promise<BlogPost>
  updatePost(id: string, input: UpdateBlogPostInput): Promise<BlogPost>
  deletePost(id: string): Promise<void>
}
