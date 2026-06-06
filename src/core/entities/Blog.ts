export type BlogStatus = 'draft' | 'published'
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImageUrl: string | null
  authorName: string | null
  category: string | null
  tags: string[]
  status: BlogStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateBlogPostInput = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;