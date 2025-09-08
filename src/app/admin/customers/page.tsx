"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Users, Pencil, Trash2, Search, Mail } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type PersonRow = {
  id: number
  firstName: string
  middleName: string | null
  lastName: string | null
  secondLastName: string | null
  phoneNumber: string | null
  email: string | null
}

type PersonFormData = {
  firstName: string
  middleName: string
  lastName: string
  secondLastName: string
  phoneNumber: string
  email: string
}

export default function CustomersPage() {
  const supabase = createClient()
  const TABLE_NAME = 'Person' as const

  const [loading, setLoading] = useState(true)
  const [people, setPeople] = useState<PersonRow[]>([])
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<PersonRow | null>(null)
  const [form, setForm] = useState<PersonFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    phoneNumber: "",
    email: "",
  })

  useEffect(() => {
    const run = async () => {
      await fetchPeople()
      setLoading(false)
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchPeople = async () => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      toast.error(`Error al cargar clientes: ${error.message}`)
      return
    }
    setPeople((data ?? []) as unknown as PersonRow[])
  }

  const resetForm = () => {
    setForm({ firstName: "", middleName: "", lastName: "", secondLastName: "", phoneNumber: "", email: "" })
    setEditing(null)
  }

  const onSubmit = async () => {
    try {
      if (!form.firstName.trim()) {
        toast.error('El nombre es obligatorio')
        return
      }
      const payload = {
        firstName: form.firstName,
        middleName: form.middleName || null,
        lastName: form.lastName || null,
        secondLastName: form.secondLastName || null,
        phoneNumber: form.phoneNumber || null,
        email: form.email || null,
      }
      if (editing) {
        const { error } = await supabase
          .from(TABLE_NAME)
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Cliente actualizado')
      } else {
        const { error } = await supabase
          .from(TABLE_NAME)
          .insert([payload])
        if (error) throw error
        toast.success('Cliente creado')
        // Si tiene email, enviar invitación/confirmación Auth
        if (payload.email) {
          try {
            const res = await fetch('/api/auth/invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: payload.email, metadata: { firstName: payload.firstName } }),
            })
            if (!res.ok) {
              const j = await res.json().catch(() => ({}))
              throw new Error(j?.error || `HTTP ${res.status}`)
            }
            toast.success('Invitación de acceso enviada al correo')
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error desconocido'
            toast.error(`No se pudo enviar la invitación: ${msg}`)
          }
        }
      }
      await fetchPeople()
      resetForm()
    } catch (e: unknown) {
      const msg = typeof e === 'object' && e && 'message' in e ? (e as { message?: string }).message : undefined
      toast.error(`No se pudo guardar el cliente: ${msg ?? 'Error desconocido'}`)
    }
  }

  const onEdit = (p: PersonRow) => {
    setEditing(p)
    setForm({
      firstName: p.firstName ?? "",
      middleName: p.middleName ?? "",
      lastName: p.lastName ?? "",
      secondLastName: p.secondLastName ?? "",
      phoneNumber: p.phoneNumber ?? "",
      email: p.email ?? "",
    })
  }

  const onDelete = async (id: number, name: string) => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
    if (error) {
      toast.error(`No se pudo eliminar el cliente: ${error.message}`)
      return
    }
    toast.success(`Cliente \"${name}\" eliminado`)
    await fetchPeople()
  }

  const onResendInvite = async (email: string | null, name: string) => {
    if (!email) {
      toast.error('Este cliente no tiene correo')
      return
    }
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, metadata: { name } }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        if (res.status === 429) {
          toast.error('Límite de envío excedido. Espera unos minutos antes de reenviar.')
        } else {
          throw new Error(data?.error || `HTTP ${res.status}`)
        }
        return
      }
      
      if (data.note) {
        toast.info(data.note) // Usuario ya existía
      } else {
        toast.success('Invitación reenviada al correo')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo reenviar la invitación'
      toast.error(msg)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return people.filter(p => {
      const fullName = [p.firstName, p.middleName, p.lastName, p.secondLastName].filter(Boolean).join(' ').toLowerCase()
      return fullName.includes(q) || (p.email ?? '').toLowerCase().includes(q)
    })
  }, [people, search])

  const displayName = (p: PersonRow) => [p.firstName, p.middleName, p.lastName, p.secondLastName].filter(Boolean).join(' ')

  if (loading) return <LoadingSpinner Data={'Cargando clientes'} />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Clientes</h1>
          </div>
          <p className="text-gray-600 text-lg">Administra las personas (clientes) del sistema</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Nombre" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="middleName">Segundo nombre</Label>
                <Input id="middleName" value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} placeholder="Segundo nombre (opcional)" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Apellido" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secondLastName">Segundo apellido</Label>
                <Input id="secondLastName" value={form.secondLastName} onChange={e => setForm(f => ({ ...f, secondLastName: e.target.value }))} placeholder="Segundo apellido (opcional)" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Teléfono</Label>
                <Input id="phoneNumber" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="+591 70000000" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSubmit}>{editing ? 'Actualizar' : 'Crear'}</Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle>Clientes ({filtered.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input className="pl-10" placeholder="Buscar por nombre o correo" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell className="font-medium">{displayName(p)}</TableCell>
                      <TableCell>{p.email ?? '—'}</TableCell>
                      <TableCell>{p.phoneNumber ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Reenviar invitación"
                            onClick={() => onResendInvite(p.email, displayName(p))}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Estás seguro de que quieres eliminar &quot;<strong>{displayName(p)}</strong>&quot;? Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(p.id, displayName(p))}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}