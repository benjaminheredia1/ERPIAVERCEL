import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type PersonRow = {
  id: number
  firstName: string
  lastName?: string | null
  email?: string | null
  phoneNumber?: string | null
}

// 📄 GET - Obtener empleados disponibles para asignar órdenes
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: employeds, error: empErr } = await supabase
      .from('Employed')
      .select('id, employedId, personId')
    if (empErr) throw empErr

    if (!employeds || employeds.length === 0) return NextResponse.json({ employees: [] })

    const personIds = Array.from(new Set(employeds.map(e => e.personId)))
    const { data: persons, error: perErr } = await supabase
      .from('Person')
      .select('id, firstName, lastName, email, phoneNumber')
      .in('id', personIds as number[])
    if (perErr) throw perErr

  const personById = new Map<number, PersonRow>()
  ;(persons as PersonRow[] | null)?.forEach(p => personById.set(p.id, p))

    const employees = employeds.map(e => {
      const p = personById.get(e.personId)
      const firstName = p?.firstName ?? ''
      const lastName = p?.lastName ?? ''
      return {
        id: e.id,
        employedId: e.employedId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email: p?.email ?? '',
        phone: p?.phoneNumber ?? ''
      }
    })

    return NextResponse.json({ employees })

  } catch (error) {
  console.error('Error in GET /api/admin/employees (supabase):', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
