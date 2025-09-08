import { NextResponse } from 'next/server'

// Endpoint de prueba deshabilitado: se migró a Supabase y ya no se usa Prisma.
export async function GET() {
  return NextResponse.json({
    ok: true,
    note: 'Este endpoint de prueba fue deshabilitado. Ya no se usa Prisma en producción.'
  })
}
