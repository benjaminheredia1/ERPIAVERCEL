import { Key, Shield, UserCheck, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type SimpleUser = {
  status?: string | null
  role?: string | null
  twoFactorEnabled?: boolean | null
}

export default function CardUser({ users = [] }: { users?: SimpleUser[] }) {

    return (<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">usuarios del sistema</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Array.isArray(users) ? users.filter(u => u.status === 'active').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">usuarios activos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {Array.isArray(users) ? users.filter(u => u.role === 'admin' || u.role === 'super_admin').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">con permisos admin</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA Habilitado</CardTitle>
            <Key className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Array.isArray(users) ? users.filter(u => !!u.twoFactorEnabled).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">con 2FA activo</p>
          </CardContent>
        </Card>
      </div>)
}