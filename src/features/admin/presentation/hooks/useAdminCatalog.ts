import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AdminCategoryRecord, AdminProductRecord, AdminProductVariantRecord } from '@/application/dtos/admin'
import type { AdminUseCases } from '@/application/use-cases/admin-use-cases'

type CategoryFormState = {
  id: string
  name: string
  apiCategoryKey: string
}

const emptyCategoryForm: CategoryFormState = {
  id: '',
  name: '',
  apiCategoryKey: '',
}

export function useAdminCatalog(adminUseCases: AdminUseCases) {
  const queryClient = useQueryClient()
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('All')
  const [productPage, setProductPage] = useState(1)
  const productItemsPerPage = 10
  const [categoryPage, setCategoryPage] = useState(1)
  const categoryItemsPerPage = 10
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<AdminProductRecord | null>(null)
  const [configOnlyMode, setConfigOnlyMode] = useState(false)

  const productConfigsQuery = useQuery({
    queryKey: ['admin', 'product-configs'],
    queryFn: () => adminUseCases.getAdminProductVariants(),
  })

  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminUseCases.getAdminProducts(),
  })

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminUseCases.getAdminCategories(),
  })

  const existingConfigs = useMemo(() => {
    if (!editingProduct) return []
    return (productConfigsQuery.data ?? []).filter(
      (config: AdminProductVariantRecord) => config.product_id === editingProduct.id,
    ) as AdminProductVariantRecord[]
  }, [editingProduct, productConfigsQuery.data])

  const filteredProducts = useMemo(() => {
    const list = productsQuery.data ?? []
    const normalizedSearch = productSearch.toLowerCase()

    return list.filter((product: AdminProductRecord) => {
      const categoryName = categoriesQuery.data?.find((category: AdminCategoryRecord) => category.id === product.category_id)?.name ?? ''
      const matchesSearch =
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.brand?.toLowerCase().includes(normalizedSearch) ?? false)
      const matchesCategory =
        productCategoryFilter === 'All' ||
        categoryName.toLowerCase() === productCategoryFilter.toLowerCase()
      return matchesSearch && matchesCategory
    })
  }, [productsQuery.data, productSearch, productCategoryFilter, categoriesQuery.data])

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((productPage - 1) * productItemsPerPage, productPage * productItemsPerPage)
  }, [filteredProducts, productPage])
  const totalProductPages = Math.ceil(filteredProducts.length / productItemsPerPage)

  const filteredCategories = useMemo(() => {
    const list = categoriesQuery.data ?? []
    const normalizedSearch = categorySearch.toLowerCase()
    return normalizedSearch
      ? list.filter(
          (category: AdminCategoryRecord) =>
            category.name.toLowerCase().includes(normalizedSearch) ||
            category.api_category_key.toLowerCase().includes(normalizedSearch),
        )
      : list
  }, [categoriesQuery.data, categorySearch])

  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(
      (categoryPage - 1) * categoryItemsPerPage,
      categoryPage * categoryItemsPerPage,
    )
  }, [filteredCategories, categoryPage])
  const totalCategoryPages = Math.ceil(filteredCategories.length / categoryItemsPerPage)

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      await queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      await queryClient.invalidateQueries({ queryKey: ['landing', 'products'] })
    },
  })

  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      const input = {
        name: categoryForm.name.trim(),
        api_category_key: categoryForm.apiCategoryKey.trim().toLowerCase(),
      }

      if (!input.name || !input.api_category_key) {
        throw new Error('Please fill in all category details.')
      }

      if (categoryForm.id) {
        return adminUseCases.updateCategory(categoryForm.id, input)
      }

      return adminUseCases.createCategory(input)
    },
    onSuccess: async () => {
      setCategoryForm(emptyCategoryForm)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })

  const deleteProductConfigMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteProductVariant(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'product-configs'] })
    },
  })

  const openProductModal = (product?: AdminProductRecord) => {
    setEditingProduct(product ?? null)
    setConfigOnlyMode(false)
    setProductModalOpen(true)
  }

  const openCategoryModal = (category?: { id: string; name: string; api_category_key: string }) => {
    setCategoryForm(
      category
        ? { id: category.id, name: category.name, apiCategoryKey: category.api_category_key }
        : emptyCategoryForm,
    )
    setCategoryModalOpen(true)
  }

  const updateProductSearch = (value: string) => {
    setProductSearch(value)
    setProductPage(1)
  }

  const updateProductCategoryFilter = (value: string) => {
    setProductCategoryFilter(value)
    setProductPage(1)
  }

  const closeProductModal = () => {
    setConfigOnlyMode(false)
    setProductModalOpen(false)
    setEditingProduct(null)
  }

  const handleProductSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'product-configs'] })
    queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
    queryClient.invalidateQueries({ queryKey: ['makeup', 'catalog'] })
    setProductModalOpen(false)
    setEditingProduct(null)
  }

  const deleteProduct = (product: AdminProductRecord) => {
    if (confirm(`Delete ${product.name}?`)) {
      deleteProductMutation.mutate(product.id)
    }
  }

  const updateCategorySearch = (value: string) => {
    setCategorySearch(value)
    setCategoryPage(1)
  }

  const updateCategoryPage = (page: number) => {
    setCategoryPage(page)
  }

  const updateCategoryForm = (form: CategoryFormState) => {
    setCategoryForm(form)
  }

  const deleteCategory = (category: { id: string; name: string }) => {
    if (confirm(`Delete category ${category.name}?`)) {
      deleteCategoryMutation.mutate(category.id)
    }
  }

  const saveCategory = async () => {
    await saveCategoryMutation.mutateAsync()
    setCategoryModalOpen(false)
  }

  const closeCategoryModal = () => {
    setCategoryModalOpen(false)
  }

  const editVariant = (product: AdminProductRecord) => {
    setEditingProduct(product)
    setConfigOnlyMode(true)
    setProductModalOpen(true)
  }

  const deleteVariant = (variant: AdminProductVariantRecord) => {
    if (confirm('Delete this variant?')) {
      deleteProductConfigMutation.mutate(variant.id)
    }
  }

  return {
    productConfigsQuery,
    productsQuery,
    categoriesQuery,
    existingConfigs,
    productSearch,
    productCategoryFilter,
    productPage,
    productModalOpen,
    configOnlyMode,
    editingProduct,
    paginatedProducts,
    filteredProducts,
    totalProductPages,
    categorySearch,
    categoryPage,
    categoryModalOpen,
    categoryForm,
    paginatedCategories,
    filteredCategories,
    totalCategoryPages,
    deleteProductMutation,
    saveCategoryMutation,
    deleteCategoryMutation,
    deleteProductConfigMutation,
    openProductModal,
    openCategoryModal,
    updateProductSearch,
    updateProductCategoryFilter,
    updateProductPage: setProductPage,
    closeProductModal,
    handleProductSaved,
    deleteProduct,
    updateCategorySearch,
    updateCategoryPage,
    updateCategoryForm,
    deleteCategory,
    saveCategory,
    closeCategoryModal,
    editVariant,
    deleteVariant,
  }
}
