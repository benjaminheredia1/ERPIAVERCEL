import { NextResponse } from 'next/server'

// Datos de ejemplo para categorías
const mockCategories = [
  { id: 1, name: "Electrónicos", description: "Dispositivos electrónicos y gadgets" },
  { id: 2, name: "Ropa", description: "Vestimenta y accesorios" },
  { id: 3, name: "Hogar", description: "Artículos para el hogar" },
  { id: 4, name: "Deportes", description: "Equipamiento deportivo" }
]

export async function GET() {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return NextResponse.json(mockCategories)
}
