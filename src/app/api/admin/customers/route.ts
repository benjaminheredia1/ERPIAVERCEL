import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 📄 GET - Obtener clientes disponibles
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('Person')
      .select('id, firstName, lastName, middleName, secondLastName, email, phoneNumber')
      .order('firstName', { ascending: true })
    if (error) throw error

    const customers = (data || []).map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName || '',
      fullName: [c.firstName, c.lastName].filter(Boolean).join(' ').trim(),
      email: c.email,
      phone: c.phoneNumber,
      company: ''
    }))

    return NextResponse.json({ customers })

  } catch (error) {
  console.error('Error in GET /api/admin/customers (supabase):', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
