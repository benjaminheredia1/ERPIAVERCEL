import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

// 🔍 Schema de validación para usuarios
const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  user_metadata: z.object({
    firstName: z.string().min(1, 'Nombre requerido'),
    lastName: z.string().min(1, 'Apellido requerido'),
  role: z.enum(['super_admin', 'admin', 'manager', 'employee', 'client']).default('employee'),
    phone: z.string().optional(),
  })
})

const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  user_metadata: z.object({
    firstName: z.string().min(1, 'Nombre requerido').optional(),
    lastName: z.string().min(1, 'Apellido requerido').optional(),
  role: z.enum(['super_admin', 'admin', 'manager', 'employee', 'client']).optional(),
    phone: z.string().optional(),
  }).optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  email_confirm: z.boolean().optional(),
  ban_duration: z.string().optional(), // Para suspender usuarios
})

// 📄 GET - Obtener todos los usuarios
export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Error al obtener usuarios', details: error.message },
        { status: 500 }
      )
    }

    // Formatear datos para el frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.firstName || '',
      lastName: user.user_metadata?.lastName || '',
      fullName: `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim(),
      role: user.user_metadata?.role || 'employee',
      phone: user.user_metadata?.phone || '',
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
      emailConfirmed: user.email_confirmed_at ? true : false,
      provider: user.app_metadata?.provider || 'email',
      providers: user.app_metadata?.providers || []
    }))

    return NextResponse.json({ users: formattedUsers })

  } catch (error) {
    console.error('Error in GET /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ➕ POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos
    const validatedData = userSchema.parse(body)
    
    const supabase = createAdminClient()
    
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      user_metadata: validatedData.user_metadata,
      email_confirm: true // Confirmamos el email automáticamente
    })

    if (error) {
      console.error('Error creating user:', error)
      
      // Manejar errores específicos
      if (error.message.includes('User already registered')) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Error al crear usuario', details: error.message },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.firstName,
        lastName: user.user_metadata?.lastName,
        role: user.user_metadata?.role
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ✏️ PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const supabase = createAdminClient()
    
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      userId,
      validatedData
    )

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: 'Error al actualizar usuario', details: error.message },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No se pudo actualizar el usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.firstName,
        lastName: user.user_metadata?.lastName,
        role: user.user_metadata?.role
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error in PUT /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// 🗑️ DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'Error al eliminar usuario', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
