export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock?: number
  categoryId: number
  imageUrl?: string
  category: {
    id: number
    name: string
  }
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  categoryId: string
  imageUrl: string
}
