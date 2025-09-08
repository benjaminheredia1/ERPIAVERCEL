import { Plus, UserCog } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type SystemUserRole = 'super_admin' | 'admin' | 'manager' | 'employee'
type CreateUserForm = {
  username: string
  name: string
  email: string
  phone: string
  role: SystemUserRole
}

export default function ModalUsers({
  isCreateModalOpen = true,
  setIsCreateModalOpen,
  formData,
  setFormData,
  handleCreateUser
}: {
  isCreateModalOpen?: boolean
  setIsCreateModalOpen: (open: boolean) => void
  formData: CreateUserForm
  setFormData: (data: CreateUserForm) => void
  handleCreateUser: () => void
}) {

    return(
<div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCog className="h-8 w-8 text-blue-600" />
            Gestión de Usuarios del Sistema
          </h1>
          <p className="text-gray-600 mt-1">Administra usuarios internos, permisos y accesos</p>
        </div>
  <Dialog open={isCreateModalOpen} onOpenChange={(open) => setIsCreateModalOpen(open)}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario del Sistema</DialogTitle>
              <DialogDescription>
                Agrega un nuevo usuario interno con permisos específicos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="usuario123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="usuario@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as SystemUserRole })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Administrador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="employee">Empleado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

           
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>
                Crear Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
}