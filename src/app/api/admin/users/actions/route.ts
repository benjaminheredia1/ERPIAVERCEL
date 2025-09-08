import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 🔐 POST - Acciones específicas sobre usuarios (suspender, activar, resetear contraseña)
export async function POST(request: NextRequest) {
  try {
    const { userId, action, ...data } = await request.json()
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: 'ID de usuario y acción requeridos' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    switch (action) {
      case 'suspend':
        // Suspender usuario por 30 días (por defecto)
        const suspendDuration = data.duration || '30 days'
        const { error: suspendError } = await supabase.auth.admin.updateUserById(
          userId,
          { ban_duration: suspendDuration }
        )
        
        if (suspendError) {
          return NextResponse.json(
            { error: 'Error al suspender usuario', details: suspendError.message },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          message: `Usuario suspendido por ${suspendDuration}`
        })

      case 'activate':
        // Activar usuario (quitar suspensión)
        const { error: activateError } = await supabase.auth.admin.updateUserById(
          userId,
          { ban_duration: 'none' }
        )
        
        if (activateError) {
          return NextResponse.json(
            { error: 'Error al activar usuario', details: activateError.message },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          message: 'Usuario activado correctamente'
        })

      case 'reset_password':
        // Generar enlace de recuperación de contraseña
        const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: data.email,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
          }
        })
        
        if (resetError) {
          return NextResponse.json(
            { error: 'Error al generar enlace de recuperación', details: resetError.message },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          message: 'Enlace de recuperación generado',
          resetLink: resetData.properties?.action_link
        })

      case 'confirm_email':
        // Confirmar email manualmente
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          userId,
          { email_confirm: true }
        )
        
        if (confirmError) {
          return NextResponse.json(
            { error: 'Error al confirmar email', details: confirmError.message },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          message: 'Email confirmado correctamente'
        })

      case 'update_role':
        // Actualizar rol del usuario
        if (!data.role) {
          return NextResponse.json(
            { error: 'Rol requerido' },
            { status: 400 }
          )
        }
        
        const { error: roleError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            user_metadata: {
              role: data.role
            }
          }
        )
        
        if (roleError) {
          return NextResponse.json(
            { error: 'Error al actualizar rol', details: roleError.message },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          message: `Rol actualizado a ${data.role}`
        })

      default:
        return NextResponse.json(
          { error: `Acción no válida: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in POST /api/admin/users/actions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
