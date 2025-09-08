"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { 
  UserCog, 
  Search, 
  Edit,
  Trash2,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  Key,
  RefreshCw,
  UserPlus
} from "lucide-react"

// 🔍 Tipos para usuarios de Supabase Auth
interface SupabaseUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: 'super_admin' | 'admin' | 'manager' | 'employee' | 'client'
  phone: string
  createdAt: string
  lastSignIn?: string
  emailConfirmed: boolean
  provider: string
  providers: string[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<SupabaseUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SupabaseUser | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "employee" as SupabaseUser['role'],
    password: "",
    confirmPassword: ""
  })

  // 📡 Cargar usuarios desde Supabase
  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      } else {
        toast.error(data.error || 'Error al cargar usuarios')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // 🔍 Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  // ➕ Crear nuevo usuario
  const handleCreateUser = async () => {
    try {
      setActionLoading('create')
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden')
        return
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          user_metadata: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            phone: formData.phone
          }
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Usuario creado exitosamente')
        setIsCreateModalOpen(false)
        resetForm()
        loadUsers() // Recargar lista
      } else {
        toast.error(data.error || 'Error al crear usuario')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Error al crear usuario')
    } finally {
      setActionLoading(null)
    }
  }

  // ✏️ Editar usuario
  const handleEditUser = (user: SupabaseUser) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: "",
      confirmPassword: ""
    })
  }

  // 💾 Actualizar usuario
  const handleUpdateUser = async () => {
    if (!editingUser) return
    
    try {
      setActionLoading('update')
      
      const updateData: {
        email: string;
        user_metadata: {
          firstName: string;
          lastName: string;
          role: string;
          phone: string;
        };
        password?: string;
      } = {
        email: formData.email,
        user_metadata: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          phone: formData.phone
        }
      }

      // Solo incluir contraseña si se proporcionó
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Las contraseñas no coinciden')
          return
        }
        updateData.password = formData.password
      }

      const response = await fetch(`/api/admin/users?id=${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Usuario actualizado exitosamente')
        setEditingUser(null)
        resetForm()
        loadUsers()
      } else {
        toast.error(data.error || 'Error al actualizar usuario')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar usuario')
    } finally {
      setActionLoading(null)
    }
  }

  // 🗑️ Eliminar usuario
  const handleDeleteUser = async (id: string) => {
    try {
      setActionLoading(id)
      
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Usuario eliminado exitosamente')
        loadUsers()
      } else {
        toast.error(data.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar usuario')
    } finally {
      setActionLoading(null)
    }
  }

  // 🔄 Acciones específicas
  const handleUserAction = async (userId: string, action: string, additionalData?: Record<string, unknown>) => {
    try {
      setActionLoading(`${action}-${userId}`)
      
      const response = await fetch('/api/admin/users/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          ...additionalData
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(data.message)
        loadUsers()
      } else {
        toast.error(data.error || `Error al ejecutar ${action}`)
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error)
      toast.error(`Error al ejecutar ${action}`)
    } finally {
      setActionLoading(null)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "employee",
      password: "",
      confirmPassword: ""
    })
  }

  // 🎨 Funciones de utilidad para badges y UI
  const getRoleBadge = (role: SupabaseUser['role']) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
      manager: "bg-orange-100 text-orange-800",
  employee: "bg-blue-100 text-blue-800",
  client: "bg-gray-100 text-gray-800"
    }
    const labels = {
      super_admin: "Super Admin",
      admin: "Administrador",
      manager: "Gerente",
  employee: "Empleado",
  client: "Cliente"
    }
    return <Badge className={styles[role]}>{labels[role]}</Badge>
  }

  const getStatusBadge = (emailConfirmed: boolean) => {
    return emailConfirmed ? (
      <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <LoadingSpinner Data="Cargando usuarios del sistema..." />
  }

  return (
    <div className="p-6 space-y-6">
      {/* 📊 Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema de autenticación
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      {/* 📈 Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <UserCog className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.emailConfirmed).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-orange-600">
                  {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nuevos (7 días)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(u.createdAt) > weekAgo
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔍 Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">                              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="employee">Empleado</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 📋 Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Usuarios del Sistema ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            Gestiona los usuarios registrados en el sistema de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.emailConfirmed)}</TableCell>
                    <TableCell>
                      {user.lastSignIn ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(user.lastSignIn)}
                        </div>
                      ) : (
                        <span className="text-gray-400">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={actionLoading === `update-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'reset_password', { email: user.email })}
                          disabled={actionLoading === `reset_password-${user.id}`}
                        >
                          <Key className="h-4 w-4" />
                        </Button>

                        {!user.emailConfirmed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'confirm_email')}
                            disabled={actionLoading === `confirm_email-${user.id}`}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === user.id}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente
                                el usuario <strong>{user.fullName}</strong> del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
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

      {/* 🆕 Modal para crear usuario */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario en el sistema de autenticación
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Pérez"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="juan.perez@empresa.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+591 12345678"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={(value: SupabaseUser['role']) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Empleado</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Repite la contraseña"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={actionLoading === 'create'}
            >
              {actionLoading === 'create' ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✏️ Modal para editar usuario */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">Nombre</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Apellido</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editPhone">Teléfono</Label>
              <Input
                id="editPhone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editRole">Rol</Label>
              <Select value={formData.role} onValueChange={(value: SupabaseUser['role']) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Empleado</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editPassword">Nueva Contraseña (opcional)</Label>
              <Input
                id="editPassword"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Dejar vacío para mantener actual"
              />
            </div>
            
            {formData.password && (
              <div className="space-y-2">
                <Label htmlFor="editConfirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="editConfirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Repite la nueva contraseña"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingUser(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={actionLoading === 'update'}
            >
              {actionLoading === 'update' ? 'Actualizando...' : 'Actualizar Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
