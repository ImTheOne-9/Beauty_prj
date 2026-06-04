import { dependencies } from '@/app/providers/DependencyProvider'

export async function fetchProducts() {
  await new Promise((resolve) => setTimeout(resolve, 250))
  try {
    return dependencies.useCases.products.listProductRecommendations()
  } catch {
    return []
  }
}
