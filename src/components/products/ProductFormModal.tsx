import { useState } from "react";
import { Category, ProductFormData } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner";
interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: ProductFormData) => Promise<boolean>
  categories: Category[]
  initialData?: ProductFormData
  isEditing?: boolean
}
export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
  isEditing = false
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name:  "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      imageUrl: ""
    }
  )
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
  // Enviar los datos tal cual (strings); la conversión se hace en la página contenedora
  const response = await onSubmit(formData);
      if (response) {
        onClose()
        toast.success("editado correctamente el producto");
        if (!isEditing) {
          setFormData({
            name: "",
            description: "",
            price: "",
            stock: "",
            categoryId: "",
            imageUrl: ""
          })
        }
      }
      else { 
        toast.error("Existio un error a la hora de enviar");
      }
  } catch {
      toast.error("existio un error a la hora de editar");
    } finally {
      setIsSubmitting(false)
    }

  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del producto seleccionado' : 'Agrega un nuevo producto al catálogo de tu tienda'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: iPhone 15 Pro"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción detallada del producto"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Disponible</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="Cantidad en inventario"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de Imagen</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Producto' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
