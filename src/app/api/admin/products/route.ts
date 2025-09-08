import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 📄 GET - Obtener productos disponibles
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('Product')
      .select('id, name, description, price, stock, categoryId, imageUrl')
      .order('name', { ascending: true })
    if (error) throw error

    return NextResponse.json({ products: data || [] })

  } catch (error) {
  console.error('Error in GET /api/admin/products (supabase):', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
