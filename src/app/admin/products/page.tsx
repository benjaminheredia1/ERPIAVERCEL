"use client"

import { useEffect, useState } from "react"
import { Package } from "lucide-react"
import { Product, ProductFormData, Category } from "@/types/product"
import { ProductStats } from "@/components/products/ProductStats"
import { ProductFilters } from "@/components/products/ProductFilters"
import { ProductTable } from "@/components/products/ProductTable"
import { ProductFormModal } from "@/components/products/ProductFormModal"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { createClient } from '@/lib/supabase/client'; 
import { toast } from "sonner"
export default function ProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Cargar datos iniciales
  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories()])
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helpers
  const fetchProducts = async () => {
    type SupabaseProductRow = {
      id: number
      name: string
      description: string | null
      price: number
      stock: number | null
      categoryId: number
      imageUrl: string | null
    }
    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      toast.error('Error al cargar productos')
      return
    }
  // Adaptar a tipo Product esperado por la UI
  const rows: SupabaseProductRow[] = (data ?? []) as unknown as SupabaseProductRow[]
    const adapted: Product[] = rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      price: Number(p.price) ?? 0,
      stock: p.stock ?? undefined,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl ?? undefined,
      category: { id: p.categoryId, name: '—' }, // stub si no hay relación cargada
    }))
    setProducts(adapted)
  }

  const fetchCategories = async () => {
    // Conservamos el origen anterior para categorías
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const cats = await res.json()
        setCategories(cats)
      }
    } catch {
      // noop
    }
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (id: number, name: string) => {
    const { error } = await supabase
      .from('Product')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('No se pudo eliminar el producto')
      return
    }
    toast.success(`Producto "${name}" eliminado`)
    await fetchProducts()
  }

  const handleFormSubmit = async (formData: ProductFormData): Promise<boolean> => {
    try {
      if (editingProduct) {
        const updateData = {
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price) || 0,
          stock: formData.stock ? parseInt(formData.stock, 10) : null,
          categoryId: parseInt(formData.categoryId, 10),
          imageUrl: formData.imageUrl || null,
        }
        const { error } = await supabase
          .from('Product')
          .update(updateData)
          .eq('id', editingProduct.id)
        if (error) throw error
        toast.success('Producto actualizado')
      } else {
        const insertData = {
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price) || 0,
          stock: formData.stock ? parseInt(formData.stock, 10) : null,
          categoryId: parseInt(formData.categoryId, 10),
          imageUrl: formData.imageUrl || null,
        }
        const { error } = await supabase
          .from('Product')
          .insert([insertData])
        if (error) throw error
        toast.success('Producto creado')
      }
      await fetchProducts()
      setIsModalOpen(false)
      setEditingProduct(null)
      return true
    } catch {
      toast.error('Ocurrió un error al guardar')
      return false
    }
  }

  const getInitialFormData = (): ProductFormData | undefined => {
    if (!editingProduct) return undefined
    
    return {
      name: editingProduct.name,
      description: editingProduct.description || "",
      price: editingProduct.price.toString(),
      stock: editingProduct.stock?.toString() || "",
      categoryId: editingProduct.categoryId.toString(),
      imageUrl: editingProduct.imageUrl || ""
    }
  }

  if (loading) {
    return <LoadingSpinner Data={"Cargando Productos"}/>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Productos</h1>
          </div>
          <p className="text-gray-600 text-lg">Administra el catálogo completo de productos de tu tienda</p>
        </div>

  <ProductStats products={products} totalCategories={categories.length} />

        <ProductFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          onNewProduct={handleNewProduct}
        />

        {(() => {
          const withCategoryName = products.map(p => ({
            ...p,
            category: {
              id: p.categoryId,
              name: categories.find(c => c.id === p.categoryId)?.name ?? '—'
            }
          }))
          const filtered = withCategoryName.filter(p => {
            const q = searchTerm.toLowerCase()
            const matchesSearch = p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
            const matchesCategory = selectedCategory === 'all' || String(p.categoryId) === selectedCategory
            return matchesSearch && matchesCategory
          })
          return (
            <ProductTable
              products={filtered}
              searchTerm={searchTerm}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onNewProduct={handleNewProduct}
            />
          )
        })()}

        <ProductFormModal
          key={editingProduct ? editingProduct.id : 'new'} 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          categories={categories}
          initialData={getInitialFormData()}
          isEditing={!!editingProduct}
        />
      </div>
    </div>
  )
}
