import { useState, useEffect } from "react"
import { Product, Category, ProductFormData } from "@/types/product"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        console.error('Error fetching products:', response.status)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Error fetching categories:', response.status)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const createProduct = async (formData: ProductFormData) => {
    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      stock: formData.stock ? parseInt(formData.stock) : null,
      categoryId: parseInt(formData.categoryId),
      imageUrl: formData.imageUrl || null
    }

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })

    if (response.ok) {
      await fetchProducts()
      return true
    }
    return false
  }

  const updateProduct = async (id: number, formData: ProductFormData) => {
    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      stock: formData.stock ? parseInt(formData.stock) : null,
      categoryId: parseInt(formData.categoryId),
      imageUrl: formData.imageUrl || null
    }

    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })

    if (response.ok) {
      await fetchProducts()
      return true
    }
    return false
  }

  const deleteProduct = async (id: number) => {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      await fetchProducts()
      return true
    }
    return false
  }

  return {
    products,
    categories,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  }
}
