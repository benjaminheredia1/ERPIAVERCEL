"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Msg = { id: string; role: 'user' | 'assistant'; text: string }
"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { z } from 'zod'

type Msg = { id: string; role: 'user' | 'assistant'; text: string }

// Esquemas para validar/migrar historial guardado
const MsgSchema = z.object({ id: z.string(), role: z.enum(['user','assistant']), text: z.string() })
const MsgArraySchema = z.array(MsgSchema)
const LegacyPartSchema = z.object({ type: z.literal('text'), text: z.string() })
const LegacyMsgSchema = z.object({ role: z.enum(['user','assistant']), parts: z.array(LegacyPartSchema) })
const LegacyArraySchema = z.array(LegacyMsgSchema)

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const STORAGE_KEY = 'erp.chat.messages.v1'

  const bottomRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Cargar historial desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const json = JSON.parse(raw)
      const parsed = MsgArraySchema.safeParse(json)
      if (parsed.success) {
        setMessages(parsed.data)
        return
      }
      const legacy = LegacyArraySchema.safeParse(json)
      if (legacy.success) {
        const migrated: Msg[] = legacy.data.map((m) => ({
          id: crypto.randomUUID(),
          role: m.role,
          text: m.parts.map(p => p.text).join('')
        }))
        setMessages(migrated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        return
      }
      // formato inválido → limpiar para evitar errores futuros
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      console.warn('No se pudo leer historial del chat de localStorage')
    }
  }, [])

  // Guardar historial en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // almacenamiento restringido o lleno
    }
  }, [messages])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setError(null)
    setSending(true)

    // agregar mensaje del usuario
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')

    // preparar historial para el endpoint
    const coreMessages = nextMessages.map(m => ({
      role: m.role,
      content: [{ type: 'text', text: m.text }]
    }))

    // crear placeholder del assistant y streamear
    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', text: '' }])
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: coreMessages, model: 'gpt-4o-mini' })
      })
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        const chunk = value ? decoder.decode(value, { stream: !done }) : ''
        if (chunk) {
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: m.text + chunk } : m))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de chat')
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setSending(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  return (
    <div className="p-6">
      <Card className="max-w-3xl mx-auto h-[75vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chatbot (Vercel AI SDK)</CardTitle>
          <Button variant="outline" size="sm" onClick={handleClear} disabled={sending}>Nueva conversación</Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3">
          {messages.map(m => (
            <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block rounded px-3 py-2 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {error && <div className="text-red-600">{String(error)}</div>}
          <div ref={bottomRef} />
        </CardContent>
        <form onSubmit={onSubmit} className="flex gap-2 p-4 border-t">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu mensaje..." />
          <Button type="submit" disabled={sending}>Enviar</Button>
        </form>
      </Card>
    </div>
  )
}
