"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Bot, Save, RefreshCw } from "lucide-react"
import { toast } from 'sonner'

type CompanySettings = {
  id?: number
  name: string
  description: string
  personality: string
  salesMessaging: string
}

export default function AISettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<CompanySettings | null>(null)

  const [form, setForm] = useState<CompanySettings>({
    name: '',
    description: '',
    personality: '',
    salesMessaging: ''
  })

  const loadSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/company-settings')
      const data = await res.json()
      if (res.ok) {
        setSettings(data.settings)
        if (data.settings) setForm(data.settings)
      } else {
        toast.error(data.error || 'Error al cargar configuración')
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      let res: Response
      if (!settings) {
        res = await fetch('/api/admin/company-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } else {
        const idQuery = settings.id ? `?id=${settings.id}` : ''
        res = await fetch(`/api/admin/company-settings${idQuery}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      }
      const data = await res.json()
      if (res.ok) {
        toast.success(settings ? 'Configuración actualizada' : 'Configuración creada')
        setSettings(data.settings)
      } else {
        toast.error(data.error || 'Error al guardar configuración')
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!settings?.id) return
    try {
      setSaving(true)
      const res = await fetch(`/api/admin/company-settings?id=${settings.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast.success('Configuración eliminada')
        setSettings(null)
        setForm({ name: '', description: '', personality: '', salesMessaging: '' })
      } else {
        toast.error(data.error || 'Error al eliminar configuración')
      }
    } catch (e) {
      console.error(e)
      toast.error('Error al eliminar configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-600" />
          Configuración IA Empresa
        </h1>
        <p className="text-gray-600 mt-1">Define el perfil de tu empresa para el asistente y mensajes de ventas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil de la Empresa (único)</CardTitle>
          <CardDescription>Solo puede existir un registro de configuración</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personality">Personalidad</Label>
              <Input id="personality" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salesMessaging">Mensaje de Ventas</Label>
            <Textarea id="salesMessaging" value={form.salesMessaging} onChange={(e) => setForm({ ...form, salesMessaging: e.target.value })} />
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              {settings ? 'Actualizar' : 'Crear'}
            </Button>
            {settings && (
              <Button variant="outline" onClick={handleDelete} disabled={saving}>
                Eliminar
              </Button>
            )}
            <Button variant="ghost" onClick={loadSettings} disabled={loading}>
              Recargar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
