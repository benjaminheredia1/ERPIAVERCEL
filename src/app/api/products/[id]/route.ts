import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params
    const id = parseInt(idStr)
    const body = await request.json()
    const { name, description, price, stock, categoryId, imageUrl } = body

    const updatedProduct = {
      id,
      name,
      description,
      price: Number(price),
      stock: stock ? Number(stock) : null,
      categoryId: Number(categoryId),
      imageUrl,
      category: { id: categoryId, name: "Categoría" } 
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params
    const id = parseInt(idStr)
    
    console.log(`Producto ${id} eliminado`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    )
  }
}
