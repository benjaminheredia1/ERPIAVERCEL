import { Package, AlertTriangle, Tag, TrendingDown } from "lucide-react"
import { Product } from "@/types/product"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductStatsProps {
  products: Product[]
  totalCategories: number
}

export function ProductStats({ products, totalCategories }: ProductStatsProps) {
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.stock && p.stock < 10).length
  const totalValue = products.reduce((sum, product) => sum + (product.price * (product.stock || 0)), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Productos</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{totalProducts}</div>
          <p className="text-xs text-gray-500">productos registrados</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Stock Bajo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{lowStockProducts}</div>
          <p className="text-xs text-gray-500">productos con menos de 10 unidades</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Categorías</CardTitle>
          <Tag className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{totalCategories}</div>
          <p className="text-xs text-gray-500">categorías activas</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-slate-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
          <TrendingDown className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
          <p className="text-xs text-gray-500">valor total del inventario</p>
        </CardContent>
      </Card>
    </div>
  )
}
