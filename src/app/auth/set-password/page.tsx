"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { z } from 'zod'

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial (!@#$%^&*)"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
})

type PasswordForm = z.infer<typeof passwordSchema>

export default function SetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ email?: string; user_metadata?: { firstName?: string } } | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({})

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    checkAuth()
  }, [router, supabase.auth])

  const validateForm = (data: PasswordForm) => {
    try {
      passwordSchema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof PasswordForm, string>> = {}
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof PasswordForm] = issue.message
          }
        })
        setErrors(fieldErrors)
      }
      return false
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (value || confirmPassword) {
      validateForm({ password: value, confirmPassword })
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    if (password || value) {
      validateForm({ password, confirmPassword: value })
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = { password, confirmPassword }
    
    // ✅ Validación con Zod antes de enviar
    if (!validateForm(formData)) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      toast.success('Contraseña establecida correctamente')
      
      setTimeout(() => {
        router.push('/admin/customers') 
      }, 1500)
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Verificando autenticación...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido!</h1>
          <p className="text-gray-600 mt-2">
            Hola <strong>{user.user_metadata?.firstName || user.email}</strong>
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Para completar tu cuenta, establece una contraseña
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Establecer Contraseña</CardTitle>
            <CardDescription className="text-center">
              Esta contraseña te permitirá iniciar sesión en el futuro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
                {/* 📋 Indicadores de validación en tiempo real */}
                {password && (
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Al menos 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Una mayúscula
                    </div>
                    <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Una minúscula
                    </div>
                    <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Un número
                    </div>
                    <div className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Un carácter especial
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.confirmPassword}
                  </p>
                )}
                {/* ✅ Confirmación visual */}
                {confirmPassword && password && password === confirmPassword && (
                  <p className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Las contraseñas coinciden
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || Object.keys(errors).length > 0}
              >
                {loading ? 'Estableciendo...' : 'Establecer Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Una vez establecida, podrás usar tu email y contraseña para iniciar sesión</p>
        </div>
      </div>
    </div>
  )
}
