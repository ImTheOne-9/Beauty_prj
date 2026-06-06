import type { CreateBlogPostInput, UpdateBlogPostInput } from "@/core/entities/Blog";
import type { IBlogRepository } from "@/core/interfaces/IBlogRepository";

export function createBlogUseCases(blogRepo: IBlogRepository) {
  return {
    getAllPosts: () => blogRepo.getAllPosts(),
    getPublishedPosts: () => blogRepo.getPublishedPosts(),
    getPostBySlug: (slug: string) => blogRepo.getPostBySlug(slug),
    getPopularPosts: (limit?: number) => blogRepo.getPopularPosts(limit),
    createPost: (input: CreateBlogPostInput) => blogRepo.createPost(input),
    updatePost: (id: string, input: UpdateBlogPostInput) => blogRepo.updatePost(id, input),
    deletePost: (id: string) => blogRepo.deletePost(id),
  }
}
