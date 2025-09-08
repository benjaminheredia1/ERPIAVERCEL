"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  Menu,
  Store,
  Tag,
  FileText,
  Bot,
  UserCog,
  User,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    description: "Panel principal"
  },
  {
    title: "Productos",
    icon: Package,
    href: "/admin/products",
    description: "Gestión de productos"
  },
  {
    title: "Categorías",
    icon: Tag,
    href: "/admin/categories", 
    description: "Organizar productos"
  },
  {
    title: "Órdenes",
    icon: ShoppingCart,
    href: "/admin/orders",
    description: "Pedidos y ventas"
  },
  {
    title: "Clientes",
    icon: Users,
    href: "/admin/customers",
    description: "Base de clientes"
  },
  {
    title: "Usuarios",
    icon: UserCog,
    href: "/admin/users",
    description: "Gestión de usuarios del sistema"
  },
  {
    title: "Chat",
    icon: MessageSquare,
    href: "/admin/chat",
    description: "Asistente IA"
  },
  {
    title: "Reportes",
    icon: BarChart3,
    href: "/admin/reports",
    description: "Análisis y métricas"
  },
  {
    title: "Inventario",
    icon: FileText,
    href: "/admin/inventory",
    description: "Control de stock"
  }
]

const settingsItems = [
  {
    title: "Configuración",
    icon: Settings,
    href: "/admin/settings",
    description: "Ajustes del sistema"
  },
  {
    title: "Configuración IA Empresa",
    icon: Bot,
    href: "/admin/ai-settings",
    description: "Configurar IA y automatización"
  },
  {
    title: "Mi Tienda",
    icon: Store,
    href: "/admin/store",
    description: "Configurar tienda"
  },
   {
    title: "Cerrar sesion",
    icon: User,
    href: "/admin/logout",
    description: "Cerrar sesion del usuario"
  }
]

interface SidebarContentProps {
  className?: string
  onItemClick?: () => void
}

function SidebarContent({ className, onItemClick }: SidebarContentProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col h-full min-h-0 bg-white border-r", className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">ERP Ventas</h2>
            <p className="text-xs text-gray-500">Sistema de gestión</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" alt="Usuario" />
            <AvatarFallback className="bg-blue-100 text-blue-600">AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Administrador</p>
            <p className="text-xs text-gray-500 truncate">admin@empresa.com</p>
          </div>
        </div>
      </div>

  <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="space-y-1">
          <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Principal
          </h3>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <h3 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sistema
          </h3>
          {settingsItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors group",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t">
        <div className="text-xs text-gray-500 text-center">
          ERP Ventas v1.0.0
        </div>
      </div>
    </div>
  )
}

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:min-h-0 lg:overflow-hidden">
        <SidebarContent />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-lg">ERP Ventas</h1>
            </div>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
          </div>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>

  <SheetContent side="left" className="p-0 w-64 max-h-screen overflow-y-auto">
          <SidebarContent onItemClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
