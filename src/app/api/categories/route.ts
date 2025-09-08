import { NextResponse } from 'next/server'

// Datos de ejemplo para categorías mientras se configura la base de datos
const mockCategories = [
  { id: 1, name: "Electrónicos", description: "Dispositivos electrónicos y gadgets" },
  { id: 2, name: "Ropa", description: "Vestimenta y accesorios" },
  { id: 3, name: "Hogar", description: "Artículos para el hogar" },
  { id: 4, name: "Deportes", description: "Equipamiento deportivo" }
]

export async function GET() {
  try {
    // Por ahora devolvemos datos mock mientras se configura la conexión
    return NextResponse.json(mockCategories)
    
    // Código para usar cuando la base de datos esté lista:
    // const prisma = new PrismaClient()
    // const categories = await prisma.category.findMany({
    //   orderBy: { name: 'asc' }
    // })
    // return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(mockCategories) // Fallback a datos mock
  }
}
