import { NextRequest, NextResponse } from 'next/server'

// Datos de ejemplo para productos mientras se configura la base de datos
const mockProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    description: "El último smartphone de Apple con chip A17 Pro y cámara de 48MP",
    price: 999.99,
    stock: 25,
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
    category: { id: 1, name: "Electrónicos" }
  },
  {
    id: 2,
    name: "MacBook Air M3",
    description: "Laptop ultradelgada con chip M3 de Apple y pantalla Retina de 13.6\"",
    price: 1299.99,
    stock: 15,
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
    category: { id: 1, name: "Electrónicos" }
  },
  {
    id: 3,
    name: "Camiseta Premium",
    description: "Camiseta de algodón 100% orgánico con diseño moderno",
    price: 29.99,
    stock: 100,
    categoryId: 2,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    category: { id: 2, name: "Ropa" }
  },
  {
    id: 4,
    name: "Jeans Denim",
    description: "Jeans clásicos de mezclilla azul con corte recto",
    price: 79.99,
    stock: 50,
    categoryId: 2,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
    category: { id: 2, name: "Ropa" }
  },
  {
    id: 5,
    name: "Sofá Moderno",
    description: "Sofá de 3 plazas tapizado en tela gris con estructura de madera",
    price: 799.99,
    stock: 8,
    categoryId: 3,
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
    category: { id: 3, name: "Hogar" }
  },
  {
    id: 6,
    name: "Mesa de Centro",
    description: "Mesa de centro de madera roble maciza con acabado natural",
    price: 299.99,
    stock: 12,
    categoryId: 3,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
    category: { id: 3, name: "Hogar" }
  },
  {
    id: 7,
    name: "Bicicleta de Montaña",
    description: "Bicicleta todo terreno con suspensión completa y frenos de disco",
    price: 1299.99,
    stock: 5,
    categoryId: 4,
    imageUrl: "https://images.unsplash.com/photo-1544191696-15693072e0b0?w=500",
    category: { id: 4, name: "Deportes" }
  },
  {
    id: 8,
    name: "Pelota de Fútbol",
    description: "Pelota oficial FIFA de cuero sintético para uso profesional",
    price: 39.99,
    stock: 30,
    categoryId: 4,
    imageUrl: "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=500",
    category: { id: 4, name: "Deportes" }
  },
  {
    id: 9,
    name: "AirPods Pro",
    description: "Auriculares inalámbricos con cancelación activa de ruido",
    price: 249.99,
    stock: 6,
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500",
    category: { id: 1, name: "Electrónicos" }
  },
  {
    id: 10,
    name: "Smartwatch",
    description: "Reloj inteligente con monitor de salud y GPS integrado",
    price: 199.99,
    stock: 20,
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: { id: 1, name: "Electrónicos" }
  }
]

let nextId = 11

export async function GET() {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300))
    return NextResponse.json(mockProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, stock, categoryId, imageUrl } = body

    // Buscar la categoría
    const categories = [
      { id: 1, name: "Electrónicos" },
      { id: 2, name: "Ropa" },
      { id: 3, name: "Hogar" },
      { id: 4, name: "Deportes" }
    ]
    
    const category = categories.find(c => c.id === categoryId)
    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 400 }
      )
    }

    const newProduct = {
      id: nextId++,
      name,
      description,
      price: Number(price),
  // Asegurar número para cumplir con el tipo inferido de mockProducts
  stock: stock !== undefined && stock !== null ? Number(stock) : 0,
      categoryId: Number(categoryId),
      imageUrl,
      category: { id: category.id, name: category.name }
    }

    mockProducts.push(newProduct)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    )
  }
}
