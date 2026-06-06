import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateBlogPostInput, UpdateBlogPostInput } from '@/core/entities'
import type { Dependencies } from '@/app/dependencies'

type BlogUseCases = Dependencies['useCases']['blogs']

export type BlogFormState = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImageUrl: string
  authorName: string
  category: string
  tags: string
  status: 'draft' | 'published'
  publishedAt: string
}

const emptyForm: BlogFormState = {
  id: '',
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  authorName: '',
  category: '',
  tags: '',
  status: 'draft',
  publishedAt: '',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toInput(form: BlogFormState): CreateBlogPostInput {
  const publishedAt = form.status === 'published'
    ? form.publishedAt || new Date().toISOString()
    : null

  return {
    slug: form.slug.trim() || slugify(form.title),
    title: form.title.trim(),
    excerpt: form.excerpt.trim() || null,
    content: form.content.trim(),
    coverImageUrl: form.coverImageUrl.trim() || null,
    authorName: form.authorName.trim() || null,
    category: form.category.trim() || null,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    status: form.status,
    publishedAt,
  }
}

export function useAdminBlog(blogUseCases: BlogUseCases) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<BlogFormState>(emptyForm)

  const postsQuery = useQuery({
    queryKey: ['admin', 'blog'],
    queryFn: () => blogUseCases.getAllPosts(),
  })

  const filteredPosts = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return (postsQuery.data ?? []).filter((post) => {
      const matchesSearch =
        !normalized ||
        post.title.toLowerCase().includes(normalized) ||
        post.slug.toLowerCase().includes(normalized)
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [postsQuery.data, search, statusFilter])

  const savePostMutation = useMutation({
    mutationFn: async () => {
      const input = toInput(form)
      if (!input.title || !input.slug || !input.content) {
        throw new Error('Title, slug, and content are required.')
      }

      if (form.id) {
        return blogUseCases.updatePost(form.id, input as UpdateBlogPostInput)
      }

      return blogUseCases.createPost(input)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] })
      await queryClient.invalidateQueries({ queryKey: ['blog'] })
      setModalOpen(false)
      setForm(emptyForm)
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => blogUseCases.deletePost(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] })
      await queryClient.invalidateQueries({ queryKey: ['blog'] })
    },
  })

  const openCreate = () => {
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (post: NonNullable<typeof postsQuery.data>[number]) => {
    setForm({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt ?? '',
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? '',
      authorName: post.authorName ?? '',
      category: post.category ?? '',
      tags: post.tags.join(', '),
      status: post.status,
      publishedAt: post.publishedAt ?? '',
    })
    setModalOpen(true)
  }

  const updateForm = (patch: Partial<BlogFormState>) => {
    setForm((current) => ({
      ...current,
      ...patch,
      slug: patch.title && !current.id && !current.slug ? slugify(patch.title) : patch.slug ?? current.slug,
    }))
  }

  const closeModal = () => setModalOpen(false)
  const savePost = () => savePostMutation.mutateAsync()
  const deletePost = (id: string) => deletePostMutation.mutate(id)

  return {
    postsQuery,
    filteredPosts,
    search,
    statusFilter,
    modalOpen,
    form,
    savePostMutation,
    deletePostMutation,
    setSearch,
    setStatusFilter,
    openCreate,
    openEdit,
    closeModal,
    updateForm,
    savePost,
    deletePost,
  }
}
