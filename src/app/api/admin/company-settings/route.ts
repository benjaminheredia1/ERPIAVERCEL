import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

type CompanySettingsRow = {
  id: number
  name: string
  description: string
  personality: string
  salesMessaging: string
}

const settingsSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().default(''),
  personality: z.string().default(''),
  salesMessaging: z.string().default('')
})

// GET: obtener el único registro (si existe)
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('CompanySettings')
      .select('id, name, description, personality, salesMessaging')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error

    const settings = (data?.[0] as CompanySettingsRow | undefined) ?? null
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error in GET /api/admin/company-settings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST: crear registro si no existe ninguno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = settingsSchema.parse(body)

    const supabase = createAdminClient()

    // Verificar si ya existe un registro
    const { data: existing, error: existErr } = await supabase
      .from('CompanySettings')
      .select('id')
      .limit(1)
    if (existErr) throw existErr
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Ya existe un registro de configuración' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('CompanySettings')
      .insert({
        name: parsed.name,
        description: parsed.description,
        personality: parsed.personality,
        salesMessaging: parsed.salesMessaging
      })
      .select('id, name, description, personality, salesMessaging')
      .single()
    if (error) throw error

    return NextResponse.json({ message: 'Configuración creada', settings: data })
  } catch (error) {
    console.error('Error in POST /api/admin/company-settings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT: actualizar el único registro (por id o el primero si no se pasa)
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')
    const body = await request.json()
    const parsed = settingsSchema.partial().refine((v) => Object.keys(v).length > 0, {
      message: 'Nada para actualizar'
    }).parse(body)

    const supabase = createAdminClient()

    let targetId: number | null = idParam ? parseInt(idParam) : null
    if (!targetId) {
      const { data: first, error: firstErr } = await supabase
        .from('CompanySettings')
        .select('id')
        .order('id', { ascending: true })
        .limit(1)
      if (firstErr) throw firstErr
      targetId = first?.[0]?.id ?? null
    }

    if (!targetId) {
      return NextResponse.json({ error: 'No existe configuración para actualizar' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('CompanySettings')
      .update(parsed)
      .eq('id', targetId)
      .select('id, name, description, personality, salesMessaging')
      .single()
    if (error) throw error

    return NextResponse.json({ message: 'Configuración actualizada', settings: data })
  } catch (error) {
    console.error('Error in PUT /api/admin/company-settings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE: eliminar el único registro (por id o el primero)
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')
    const supabase = createAdminClient()

    let targetId: number | null = idParam ? parseInt(idParam) : null
    if (!targetId) {
      const { data: first, error: firstErr } = await supabase
        .from('CompanySettings')
        .select('id')
        .order('id', { ascending: true })
        .limit(1)
      if (firstErr) throw firstErr
      targetId = first?.[0]?.id ?? null
    }

    if (!targetId) {
      return NextResponse.json({ error: 'No existe configuración para eliminar' }, { status: 404 })
    }

    const { error } = await supabase
      .from('CompanySettings')
      .delete()
      .eq('id', targetId)
    if (error) throw error

    return NextResponse.json({ message: 'Configuración eliminada' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/company-settings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
