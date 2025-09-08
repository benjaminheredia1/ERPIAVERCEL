import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/auth/invite
// body: { email: string, metadata?: Record<string, any> }
export async function POST(req: Request) {
  try {
    const { email, metadata } = await req.json() as { email?: string, metadata?: Record<string, unknown> }
    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })
    }

    console.log('🔄 Enviando invitación a:', email)
    const supabaseAdmin = createAdminClient()

    // Construir redirectTo usando el origin o la variable de entorno del sitio
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''
    const redirectTo = origin ? `${origin.replace(/\/$/, '')}/auth/callback` : undefined
    console.log('📍 RedirectTo:', redirectTo)

    // Envía invitación. Crea el usuario si no existe y manda correo con enlace.
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: metadata as Record<string, string | number | boolean | null | object> | undefined,
      redirectTo,
    })

    if (error) {
      console.error('❌ Error en inviteUserByEmail:', error)
      
      // Manejar diferentes tipos de errores
      if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
        return NextResponse.json({ 
          error: 'Límite de envío excedido. Espera unos minutos antes de reenviar.' 
        }, { status: 429 })
      }
      
      // Si ya existe, lo tratamos como éxito idempotente
      if (typeof error.message === 'string' && 
          (error.message.toLowerCase().includes('already registered') || 
           error.code === 'email_exists')) {
        return NextResponse.json({ 
          ok: true, 
          note: 'Usuario ya existía, no se envió nueva invitación' 
        })
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ Invitación enviada exitosamente:', data.user?.email)
    return NextResponse.json({ user: data.user })
  } catch (e) {
    console.error('💥 Error inesperado en /api/auth/invite:', e)
    const msg = e instanceof Error ? e.message : 'Error inesperado'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
