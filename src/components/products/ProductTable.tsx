import { Pencil, Trash2, Package, Plus } from "lucide-react"
import Image from "next/image"
import { Product } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface ProductTableProps {
  products: Product[]
  searchTerm: string
  onEdit: (product: Product) => void
  onDelete: (id: number, name: string) => void
  onNewProduct: () => void
}

export function ProductTable({ 
  products, 
  searchTerm, 
  onEdit, 
  onDelete, 
  onNewProduct 
}: ProductTableProps) {
  if (!products.length) return <LoadingSpinner />;
  return (
    <Card>
      <CardHeader className="border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Productos ({products.length})
          </CardTitle>
          {searchTerm && (
            <Badge variant="secondary" className="text-sm">
              Filtrado por: &quot;{searchTerm}&quot;
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'Comienza agregando tu primer producto.'}
            </p>
            <Button onClick={onNewProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ProductRowProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: number, name: string) => void
}

function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
    if (!product) return null;

  const productName = product?.name ?? 'Producto';
  const categoryName = product?.category?.name ?? 'Sin categoría';
  const hasImage = Boolean(product?.imageUrl);
  const priceText = typeof product?.price === 'number' ? product.price.toLocaleString() : '—';
  const stockValue = typeof product?.stock === 'number' ? product.stock : null;
  const stockVariant = stockValue !== null && stockValue < 10 ? 'destructive' : 'default';

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-3">
      {hasImage ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              <Image
        src={product.imageUrl as string}
        alt={productName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{productName}</div>
            {product.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {product.description}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-medium">
          {categoryName}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-medium text-gray-900">
          ${priceText}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={stockVariant} className="font-medium">
          {stockValue ?? 'N/A'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {onEdit(product);} }
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que quieres eliminar &quot;<strong>{productName}</strong>&quot;? 
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(product.id, productName)}
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
  )
}
