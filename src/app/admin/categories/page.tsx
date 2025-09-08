"use client"

import { useEffect, useState } from "react"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Category } from "@/types/product"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, FolderPlus } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type CategoryFormData = {
    name: string
    description: string
}

export default function CategoriesPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<Category[]>([])
    const [form, setForm] = useState<CategoryFormData>({ name: "", description: "" })
    const [editing, setEditing] = useState<Category | null>(null)
    const TABLE_NAME = 'Category' as const

    useEffect(() => {
        const run = async () => {
                await fetchCategories()
            setLoading(false)
        }
        run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchCategories = async () => {
        type Row = { id: number; name: string; description: string }
            const { data, error } = await supabase
                .from(TABLE_NAME)
            .select('*')
            .order('id', { ascending: true })

        if (error) {
                toast.error(`Error al cargar categorías: ${error.message}`)
            return
        }
        const rows: Row[] = (data ?? []) as Row[]
        const mapped: Category[] = rows.map(r => ({ id: r.id, name: r.name, description: r.description }))
        setCategories(mapped)
    }

    const resetForm = () => {
        setForm({ name: "", description: "" })
        setEditing(null)
    }

    const onSubmit = async () => {
        try {
            if (!form.name.trim()) {
                toast.error('El nombre es obligatorio')
                return
            }
            if (editing) {
                    const { error } = await supabase
                        .from(TABLE_NAME)
                    .update({ name: form.name, description: form.description })
                    .eq('id', editing.id)
                if (error) throw error
                toast.success('Categoría actualizada')
            } else {
                    const { error } = await supabase
                        .from(TABLE_NAME)
                    .insert([{ name: form.name, description: form.description }])
                if (error) throw error
                toast.success('Categoría creada')
            }
            await fetchCategories()
            resetForm()
                } catch (e: unknown) {
                    const msg = typeof e === 'object' && e && 'message' in e ? (e as { message?: string }).message : undefined
                    toast.error(`No se pudo guardar la categoría: ${msg ?? 'Error desconocido'}`)
        }
    }

    const onEdit = (c: Category) => {
        setEditing(c)
        setForm({ name: c.name, description: c.description })
    }

    const onDelete = async (id: number, name: string) => {
            const { error } = await supabase
                .from(TABLE_NAME)
            .delete()
            .eq('id', id)
        if (error) {
                toast.error(`No se pudo eliminar la categoría: ${error.message}`)
            return
        }
        toast.success(`Categoría "${name}" eliminada`)
        await fetchCategories()
    }

    if (loading) return <LoadingSpinner Data={'Cargando categorías'}/> 

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-6 max-w-5xl">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FolderPlus className="h-8 w-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-gray-900">Gestión de Categorías</h1>
                    </div>
                    <p className="text-gray-600 text-lg">Administra las categorías de productos</p>
                </div>

                <Card className="mb-6">
                    <CardHeader className="border-b bg-gray-50">
                        <CardTitle>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 pt-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre de la categoría" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción" />
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
                        <CardTitle>Categorías ({categories.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map(c => (
                                        <TableRow key={c.id}>
                                            <TableCell>{c.id}</TableCell>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell>{c.description}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 justify-center">
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(c)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                                                                                <AlertDialogDescription>
                                                                                                    ¿Estás seguro de que quieres eliminar &quot;<strong>{c.name}</strong>&quot;? Esta acción no se puede deshacer.
                                                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(c.id, c.name)}>Eliminar</AlertDialogAction>
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