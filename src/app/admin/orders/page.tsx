"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea"
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  RefreshCw,
  Minus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react"

 interface Order {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  customer_email: string
  assigned_employee_id?: string
  assigned_employee_name?: string
  subtotal: number
  tax: number
  total: number
  notes?: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  created_at: string
  order_items: OrderItem[]
}

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  description?: string
  category?: string
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: string
  phone: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  company?: string
}

interface OrderFormData {
  customerId: string
  customerName: string
  customerEmail: string
  assignedEmployeeId: string
  assignedEmployeeName: string
  items: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }[]
  notes: string
  status: Order['status']
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tablesExist, setTablesExist] = useState(true)

  const [formData, setFormData] = useState<OrderFormData>({
    customerId: "",
    customerName: "",
    customerEmail: "",
    assignedEmployeeId: "",
    assignedEmployeeName: "",
    items: [],
    notes: "",
    status: "pending"
  })

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        
        await Promise.all([
          loadOrders(),
          loadProducts(),
          loadEmployees(),
          loadCustomers()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
        
        // Si el error es por tablas faltantes, mostrar configuración
        const errorStr = error?.toString() || ''
        if (errorStr.includes('Could not find the table') || 
            errorStr.includes('orders') || 
            errorStr.includes('products') || 
            errorStr.includes('customers')) {
          setTablesExist(false)
        } else {
          toast.error('Error al cargar datos iniciales')
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      
      if (response.ok) {
        setOrders(data.orders)
      } else {
        toast.error(data.error || 'Error al cargar órdenes')
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Error al cargar órdenes')
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products)
      } else {
        console.error('Error loading products:', data.error)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees')
      const data = await response.json()
      
      if (response.ok) {
        setEmployees(data.employees)
      } else {
        console.error('Error loading employees:', data.error)
      }
    } catch (error) {
      console.error('Error loading employees:', error)
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      const data = await response.json()
      
      if (response.ok) {
        setCustomers(data.customers)
      } else {
        console.error('Error loading customers:', data.error)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        subtotal: 0
      }]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
    calculateTotals()
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      const item = { ...newItems[index] }
      
      if (field === 'productId') {
        const product = products.find(p => String(p.id) === String(value))
        if (product) {
          item.productId = String(product.id)
          item.productName = product.name
          item.unitPrice = product.price
        }
      } else {
        item[field as keyof typeof item] = value as never
      }
      
      // Recalcular subtotal del item
      item.subtotal = item.quantity * item.unitPrice
      newItems[index] = item
      
      return { ...prev, items: newItems }
    })
    
    // Recalcular totales después de actualizar
    setTimeout(calculateTotals, 0)
  }

  const calculateTotals = () => {
    setFormData(prev => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.subtotal, 0)
      const tax = subtotal * 0.13 // 13% de impuesto
      const total = subtotal + tax
      
      return { ...prev, subtotal, tax, total }
    })
  }

  // ➕ Crear nueva orden
  const handleCreateOrder = async () => {
    try {
      if (formData.items.length === 0) {
        toast.error('Debe agregar al menos un producto')
        return
      }

      if (!formData.customerId) {
        toast.error('Debe seleccionar un cliente')
        return
      }

      setActionLoading('create')
      
      const itemsPayload = formData.items.map(i => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
      }))

      const orderData = {
        personId: Number(formData.customerId),
        employedId: formData.assignedEmployeeId ? Number(formData.assignedEmployeeId) : undefined,
        status: formData.status,
        items: itemsPayload
      }

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Orden creada exitosamente')
        setIsCreateModalOpen(false)
        resetForm()
        loadOrders()
      } else {
        toast.error(data.error || 'Error al crear orden')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error al crear orden')
    } finally {
      setActionLoading(null)
    }
  }

  // ✏️ Editar orden
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      customerId: String(order.customer_id),
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      assignedEmployeeId: order.assigned_employee_id || "",
      assignedEmployeeName: order.assigned_employee_name || "",
      items: order.order_items.map(item => ({
        productId: String(item.product_id),
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.subtotal
      })),
      notes: order.notes || "",
      status: order.status
    })
  }

  // 💾 Actualizar orden
  const handleUpdateOrder = async () => {
    if (!editingOrder) return
    
    try {
      setActionLoading('update')
      
      const itemsPayload = formData.items.map(i => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
      }))

      const orderData = {
        personId: Number(formData.customerId),
        employedId: formData.assignedEmployeeId ? Number(formData.assignedEmployeeId) : undefined,
        status: formData.status,
        items: itemsPayload
      }

      const response = await fetch(`/api/admin/orders?id=${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Orden actualizada exitosamente')
        setEditingOrder(null)
        resetForm()
        loadOrders()
      } else {
        toast.error(data.error || 'Error al actualizar orden')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Error al actualizar orden')
    } finally {
      setActionLoading(null)
    }
  }

  // 🗑️ Eliminar orden
  const handleDeleteOrder = async (id: string) => {
    try {
      setActionLoading(id)
      
      const response = await fetch(`/api/admin/orders?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Orden eliminada exitosamente')
        loadOrders()
      } else {
        toast.error(data.error || 'Error al eliminar orden')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Error al eliminar orden')
    } finally {
      setActionLoading(null)
    }
  }

  const resetForm = () => {
    setFormData({
      customerId: "",
      customerName: "",
      customerEmail: "",
      assignedEmployeeId: "",
      assignedEmployeeName: "",
      items: [],
      notes: "",
      status: "pending"
    })
  }

  // 🎨 Funciones de utilidad para UI
  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    }
    const labels = {
      pending: "Pendiente",
      processing: "Procesando",
      completed: "Completada",
      cancelled: "Cancelada"
    }
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      processing: <AlertCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />
    }
    
    return (
      <Badge className={`${styles[status]} flex items-center gap-1`}>
        {icons[status]}
        {labels[status]}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <LoadingSpinner Data="Cargando sistema de órdenes..." />
  }

  // Si las tablas no existen, mostrar instrucciones
  if (!tablesExist) {
    return (
      <div className="p-6 space-y-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-6 w-6" />
              Tablas de Base de Datos Faltantes
            </CardTitle>
            <CardDescription>
              Las tablas necesarias para el sistema de órdenes no existen en Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-semibold mb-2">�️ Tablas faltantes:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code>products</code> - Catálogo de productos</li>
                <li><code>customers</code> - Información de clientes</li>
                <li><code>orders</code> - Órdenes principales</li>
                <li><code>order_items</code> - Detalles de productos por orden</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-2">📄 Solución:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Ve a tu proyecto en <a href="https://qeohmikhaokypldysrqb.supabase.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase</a></li>
                <li>Haz clic en <strong>SQL Editor</strong> en el menú lateral</li>
                <li>Haz clic en <strong>New query</strong></li>
                <li>Abre el archivo <code>database/orders_schema.sql</code> de tu proyecto</li>
                <li>Copia TODO el contenido y pégalo en el editor SQL</li>
                <li>Haz clic en <strong>Run</strong> ▶️ para ejecutar</li>
                <li>Recarga esta página</li>
              </ol>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold mb-2">✅ Después de ejecutar el script:</h3>
              <p className="text-sm">
                • Se crearán 4 tablas con datos de ejemplo<br />
                • El sistema estará completamente funcional<br />
                • Podrás crear órdenes con múltiples productos<br />
                • Asignar empleados opcionales a las órdenes
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => window.open('https://qeohmikhaokypldysrqb.supabase.co', '_blank')}
                className="flex items-center gap-2"
              >
                🚀 Abrir Supabase
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Verificar Tablas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* 📊 Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Órdenes</h1>
          <p className="text-gray-600 mt-1">
            Administra las órdenes de venta del sistema
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      {/* 📈 Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
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
                  placeholder="Buscar por cliente, número de orden o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 📋 Tabla de órdenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Órdenes del Sistema ({filteredOrders.length})
          </CardTitle>
          <CardDescription>
            Gestiona las órdenes de venta y asignaciones de empleados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Empleado Asignado</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-gray-500">{order.id.slice(-8)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.assigned_employee_name ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {order.assigned_employee_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{order.assigned_employee_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {order.order_items.length} producto{order.order_items.length !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(order.total)}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(order.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                          disabled={actionLoading === `update-${order.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === order.id}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar orden?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente
                                la orden <strong>{order.order_number}</strong> y todos sus items.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOrder(order.id)}
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

      {/* 🆕 Modal para crear nueva orden */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nueva Orden
            </DialogTitle>
            <DialogDescription>
              Crea una nueva orden asignando productos y opcionalmente un empleado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Cliente *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => {
                    const customer = customers.find(c => String(c.id) === value)
                    if (customer) {
                      setFormData(prev => ({
                        ...prev,
                        customerId: value,
                        customerName: customer.fullName,
                        customerEmail: customer.email
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={String(customer.id)} value={String(customer.id)}>
                        {customer.fullName} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employee">Empleado Asignado (Opcional)</Label>
                <Select 
                  value={formData.assignedEmployeeId} 
                  onValueChange={(value) => {
                    const employee = employees.find(e => String(e.id) === value)
                    setFormData(prev => ({
                      ...prev,
                      assignedEmployeeId: value === 'none' ? '' : value,
                      assignedEmployeeName: value === 'none' ? '' : (employee?.fullName || "")
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={String(employee.id)} value={String(employee.id)}>
                        {employee.fullName} - {employee.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items de la orden */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Productos *</Label>
                <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                    <div className="col-span-5">
                      <Label className="text-xs">Producto</Label>
                      <Select 
                        value={item.productId} 
                        onValueChange={(value) => updateItem(index, 'productId', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={String(product.id)} value={String(product.id)}>
                              {product.name} - {formatCurrency(product.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-9"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Precio Unit.</Label>
                      <Input
                        value={formatCurrency(item.unitPrice)}
                        disabled
                        className="h-9 bg-gray-50"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Subtotal</Label>
                      <Input
                        value={formatCurrency(item.subtotal)}
                        disabled
                        className="h-9 bg-gray-50"
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="h-9 w-9 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                  No hay productos agregados. Haz clic en &ldquo;Agregar Producto&rdquo; para comenzar.
                </div>
              )}
            </div>

            {/* Estado y notas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value: Order['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales sobre la orden..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Resumen de totales */}
            {formData.items.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(formData.items.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuesto (13%):</span>
                    <span>{formatCurrency(formData.items.reduce((sum, item) => sum + item.subtotal, 0) * 0.13)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(formData.items.reduce((sum, item) => sum + item.subtotal, 0) * 1.13)}</span>
                  </div>
                </div>
              </div>
            )}
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
              onClick={handleCreateOrder}
              disabled={actionLoading === 'create' || formData.items.length === 0 || !formData.customerId}
              className="flex items-center gap-2"
            >
              {actionLoading === 'create' && <RefreshCw className="h-4 w-4 animate-spin" />}
              Crear Orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✏️ Modal para editar orden */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Orden {editingOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Modifica los detalles de la orden existente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Cliente *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => {
                    const customer = customers.find(c => c.id === value)
                    if (customer) {
                      setFormData(prev => ({
                        ...prev,
                        customerId: value,
                        customerName: customer.fullName,
                        customerEmail: customer.email
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.fullName} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="employee">Empleado Asignado (Opcional)</Label>
                <Select 
                  value={formData.assignedEmployeeId} 
                  onValueChange={(value) => {
                    const employee = employees.find(e => e.id === value)
                    setFormData(prev => ({
                      ...prev,
                      assignedEmployeeId: value,
                      assignedEmployeeName: employee?.fullName || ""
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.fullName} - {employee.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items de la orden */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Productos *</Label>
                <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                    <div className="col-span-5">
                      <Label className="text-xs">Producto</Label>
                      <Select 
                        value={item.productId} 
                        onValueChange={(value) => updateItem(index, 'productId', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {formatCurrency(product.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-9"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Precio Unit.</Label>
                      <Input
                        value={formatCurrency(item.unitPrice)}
                        disabled
                        className="h-9 bg-gray-50"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Subtotal</Label>
                      <Input
                        value={formatCurrency(item.subtotal)}
                        disabled
                        className="h-9 bg-gray-50"
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="h-9 w-9 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {formData.items.length === 0 && (
                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                  No hay productos agregados. Haz clic en &ldquo;Agregar Producto&rdquo; para comenzar.
                </div>
              )}
            </div>

            {/* Estado y notas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(value: Order['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales sobre la orden..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Resumen de totales */}
            {formData.items.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(formData.items.reduce((sum, item) => sum + item.subtotal, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuesto (13%):</span>
                    <span>{formatCurrency(formData.items.reduce((sum, item) => sum + item.subtotal, 0) * 0.13)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(formData.items.reduce((sum, item) => sum + item.subtotal, 0) * 1.13)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingOrder(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateOrder}
              disabled={actionLoading === 'update' || formData.items.length === 0 || !formData.customerId}
              className="flex items-center gap-2"
            >
              {actionLoading === 'update' && <RefreshCw className="h-4 w-4 animate-spin" />}
              Actualizar Orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 👁️ Modal para ver detalles de orden */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalles de Orden {viewingOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          {viewingOrder && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Información del Cliente</h4>
                  <p><strong>Nombre:</strong> {viewingOrder.customer_name}</p>
                  <p><strong>Email:</strong> {viewingOrder.customer_email}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Empleado Asignado</h4>
                  {viewingOrder.assigned_employee_name ? (
                    <p>{viewingOrder.assigned_employee_name}</p>
                  ) : (
                    <p className="text-gray-400">Sin asignar</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3">Productos</h4>
                <div className="space-y-2">
                  {viewingOrder.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(viewingOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuesto:</span>
                    <span>{formatCurrency(viewingOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(viewingOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Estado y fecha */}
              <div className="flex justify-between items-center">
                <div>
                  <p><strong>Estado:</strong> {getStatusBadge(viewingOrder.status)}</p>
                </div>
                <div>
                  <p><strong>Creado:</strong> {formatDate(viewingOrder.created_at)}</p>
                </div>
              </div>

              {/* Notas */}
              {viewingOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingOrder(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}