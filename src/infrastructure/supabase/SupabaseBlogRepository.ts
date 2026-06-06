import type { BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from '@/core/entities/Blog'
import type { IBlogRepository } from '@/core/interfaces/IBlogRepository'
import { supabase } from '@/infrastructure/supabase/client'

type BlogPostRow = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  author_name: string | null
  category: string | null
  tags: string[] | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

function mapBlogRow(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    authorName: row.author_name,
    category: row.category,
    tags: row.tags ?? [],
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toBlogRowInput(input: CreateBlogPostInput | UpdateBlogPostInput) {
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    cover_image_url: input.coverImageUrl,
    author_name: input.authorName,
    category: input.category,
    tags: input.tags,
    status: input.status,
    published_at: input.publishedAt,
  }
}

export class SupabaseBlogRepository implements IBlogRepository {
  async getAllPosts(): Promise<BlogPost[]> {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return ((data ?? []) as BlogPostRow[]).map(mapBlogRow)
  }

  async getPublishedPosts(): Promise<BlogPost[]> {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })

    if (error) throw error
    return ((data ?? []) as BlogPostRow[]).map(mapBlogRow)
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw error
    return data ? mapBlogRow(data as BlogPostRow) : null
  }

  async getPopularPosts(limit = 5): Promise<BlogPost[]> {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) throw error
    return ((data ?? []) as BlogPostRow[]).map(mapBlogRow)
  }

  async createPost(input: CreateBlogPostInput): Promise<BlogPost> {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .insert(toBlogRowInput(input))
      .select('*')
      .single()

    if (error) throw error
    return mapBlogRow(data as BlogPostRow)
  }

  async updatePost(id: string, input: UpdateBlogPostInput): Promise<BlogPost> {
    const { data, error } = await (supabase as any)
      .from('blog_posts')
      .update(toBlogRowInput(input))
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return mapBlogRow(data as BlogPostRow)
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
