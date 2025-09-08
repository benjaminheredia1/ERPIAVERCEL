"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator";
import {createClient} from '@/lib/supabase/client';
import { Toaster } from "@/components/ui/sonner" ;
import { useRouter } from "next/navigation";
import {toast} from "sonner";
import { 
  Eye, 
  Lock, 
  Mail, 
  Store,
  Github,
  Chrome
} from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
export default  function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [linkError, setLinkError] = useState<{ code?: string; description?: string } | null>(null)
    const router = useRouter();
    const supabase = createClient();
    // Procesar enlaces con tokens en el hash o code en query (por ejemplo, invitaciones)
    useEffect(() => {
      const run = async () => {
        try {
          const hash = typeof window !== 'undefined' ? window.location.hash : ''
          const url = typeof window !== 'undefined' ? new URL(window.location.href) : null
          const code = url?.searchParams.get('code') || undefined
          const token_hash = url?.searchParams.get('token_hash') || undefined
          
          // Detectar errores en el hash o query
          const hashError = hash.includes('error=')
          const queryError = url?.searchParams.get('error')
          if (hashError || queryError) {
            const errCode = hash.match(/error_code=([^&]+)/)?.[1] || url?.searchParams.get('error_code') || 'unknown'
            const errDesc = (() => {
              const hashDesc = hash.match(/error_description=([^&]+)/)?.[1]
              const queryDesc = url?.searchParams.get('error_description')
              const raw = hashDesc || queryDesc
              try { return raw ? decodeURIComponent(raw) : 'Error de autenticación' } catch { return raw || 'Error de autenticación' }
            })()
            
            setLinkError({ code: errCode, description: errDesc })
            
            if (errCode === 'otp_expired') {
              toast.error('El enlace ha expirado. Ingresa tu correo para recibir uno nuevo.')
            } else {
              toast.error(errDesc)
            }
            return
          }

          // 1) Intentar canjear code/token_hash (PKCE/confirmación)
          if (code || token_hash) {
            const { error } = await supabase.auth.exchangeCodeForSession(code ?? token_hash ?? '')
            if (!error) {
              router.replace('/admin/customers')
              return
            }
          }

          // 2) Si viene con fragmento legacy (#access_token ...)
          if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.replace(/^#/, ''))
            const access_token = params.get('access_token')
            const refresh_token = params.get('refresh_token')
            if (access_token && refresh_token) {
              const { error } = await supabase.auth.setSession({ access_token, refresh_token })
              if (!error) {
                // Limpiar el hash y continuar
                window.history.replaceState({}, '', window.location.pathname + window.location.search)
                router.replace('/admin/customers')
                return
              }
            }
          }
  } catch {
          // Ignorar; el usuario puede iniciar sesión manualmente
        }
      }
      run()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const handleLogin = async () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? '')
  await supabase.auth.signInWithOAuth({
      provider: 'google', 
      options: {
    redirectTo: origin ? `${origin}/auth/callback` : undefined,
      },
    }) } 
    //Funcion para iniciar sesion
    const handleSignIn = async (e: FormEvent<HTMLFormElement>) => { 
      e.preventDefault();
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email,
        password: password
      });
      if (error) {
        toast.error("Credenciales incorrectas");
        
      }
      else {
      toast.success("Se inicio sesion correctamente"); 
      router.push("/admin");

     }
    }
    // Registro via formulario no usado en esta vista (eliminado para evitar warnings)
    
    // Reenviar invitación (usa endpoint server para evitar cerrar sesión del admin)
    const handleResendInvite = async () => {
      if (!email) {
        toast.error('Ingresa tu correo para reenviar el enlace')
        return
      }
      try {
        const res = await fetch('/api/auth/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j?.error || `HTTP ${res.status}`)
        }
        toast.success('Te enviamos un nuevo enlace al correo')
        setLinkError(null) // Limpiar error tras reenvío exitoso
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'No se pudo reenviar el enlace'
        toast.error(msg)
      }
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                    <Toaster />

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ERP Ventas</h1>
          <p className="text-gray-600">Ingresa a tu cuenta para continuar</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={e => handleSignIn(e)}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={visiblePassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value) }
                    required
                  />
                  <button
                    type="button"
                    aria-label={visiblePassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={visiblePassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setVisiblePassword(!visiblePassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Recordarme
                  </Label>
                </div>
                <Button variant="link" className="px-0 text-sm">
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>

              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
              
              {linkError?.code === 'otp_expired' && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleResendInvite}
                >
                  Reenviar enlace de invitación
                </Button>
              )}
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleLogin}>
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-blue-900">Credenciales de Demo</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Email:</strong> admin@empresa.com</p>
                <p><strong>Contraseña:</strong> admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>¿No tienes una cuenta? <Button variant="link" className="px-0">Regístrate aquí</Button></p>
          <p className="mt-2">© 2024 ERP Ventas. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}