import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint de prueba para verificar la conexión con las tablas
export async function GET() {
  try {
    const results: {
      orders: { count: number; error: string | null } | null
      products: { count: number; error: string | null } | null
      customers: { count: number; error: string | null } | null
      orderItems: { count: number; error: string | null } | null
      employees: { count: number; error: string | null } | null
      errors: Record<string, string>
    } = {
      orders: null,
      products: null,
      customers: null,
      orderItems: null,
      employees: null,
      errors: {}
    }
    
    // Probar tabla Order
    try {
      const data = await prisma.order.findMany({ take: 1 })
      results.orders = { count: data?.length || 0, error: null }
    } catch (err: unknown) {
      results.errors.orders = err instanceof Error ? err.message : 'Unknown error'
    }
    
    // Probar tabla Product
    try {
      const data = await prisma.product.findMany({ take: 1 })
      results.products = { count: data?.length || 0, error: null }
    } catch (err: unknown) {
      results.errors.products = err instanceof Error ? err.message : 'Unknown error'
    }
    
    // Probar tabla Person (customers)
    try {
      const data = await prisma.person.findMany({ take: 1 })
      results.customers = { count: data?.length || 0, error: null }
    } catch (err: unknown) {
      results.errors.customers = err instanceof Error ? err.message : 'Unknown error'
    }
    
    // Probar tabla OrderItems
    try {
      const data = await prisma.orderItems.findMany({ take: 1 })
      results.orderItems = { count: data?.length || 0, error: null }
    } catch (err: unknown) {
      results.errors.orderItems = err instanceof Error ? err.message : 'Unknown error'
    }

    // Probar tabla Employed (employees)
    try {
      const data = await prisma.employed.findMany({ take: 1 })
      results.employees = { count: data?.length || 0, error: null }
    } catch (err: unknown) {
      results.errors.employees = err instanceof Error ? err.message : 'Unknown error'
    }
    
    return NextResponse.json(results)
    
  } catch (error: unknown) {
    console.error('Error in test-tables:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
