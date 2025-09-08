"use client"

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

function AuthCallbackInner() {
  const router = useRouter()
  const search = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('Procesando enlace de acceso...')

  useEffect(() => {
    const supabase = createClient()

    async function run() {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const urlHasError = hash.includes('error=') || search.get('error')
      if (urlHasError) {
        const errCode = hash.match(/error_code=([^&]+)/)?.[1] || search.get('error_code') || 'unknown'
        const errDesc = decodeURIComponent(hash.match(/error_description=([^&]+)/)?.[1] || search.get('error_description') || 'Error de autenticación')
        setStatus('error')
        setMessage(`${errCode}: ${errDesc}`)
        return
      }

      try {
        const code = search.get('code')
        const tokenHash = search.get('token_hash')
        if (code || tokenHash) {
          const { error } = await supabase.auth.exchangeCodeForSession(code ?? tokenHash ?? '')
          if (error) throw error
        } else if (hash.includes('access_token')) {
          // 2) Flujo antiguo con fragmento: parsear y setear sesión
          const params = new URLSearchParams(hash.replace(/^#/, ''))
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')
          if (!access_token || !refresh_token) throw new Error('Faltan tokens en el enlace')
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
        } else {
          throw new Error('Enlace inválido o expirado')
        }
        setStatus('success')
        setMessage('Sesión verificada, redirigiendo...')
        // Redirige a establecer contraseña para usuarios invitados
        setTimeout(() => router.replace('/auth/set-password'), 1000)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al procesar el enlace'
        setStatus('error')
        setMessage(msg)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-700">{message}</span>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-green-600"></div>
            </div>
            <span className="text-green-700 font-medium">{message}</span>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-red-600"></div>
            </div>
            <div className="text-red-700">
              <p className="font-medium">Error al procesar el enlace</p>
              <p className="text-sm mt-1">{message}</p>
              <button 
                onClick={() => router.push('/login')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Ir a Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Cargando…</div>}>
      <AuthCallbackInner />
    </Suspense>
  )
}
