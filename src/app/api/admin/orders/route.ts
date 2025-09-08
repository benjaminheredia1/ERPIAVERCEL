import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type OrderRow = {
  id: number
  orderNumber: number
  personId: number
  employedId: number | null
  totalAmount?: number | string | null
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
}

type PersonRow = {
  id: number
  firstName: string
  middleName?: string | null
  lastName?: string | null
  secondLastName?: string | null
  email?: string | null
}

type EmployedRow = {
  id: number
  employedId: number
  personId: number
}

type OrderItemRow = {
  id: number
  orderId: number
  productId: number
  quantity: number
}

type ProductRow = {
  id: number
  name: string
  price: number | string
}

type UIOrderItem = {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

type UIOrder = {
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
  order_items: UIOrderItem[]
}
import { z } from 'zod'

// 🔍 Schemas de validación para órdenes
const orderItemSchema = z.object({
  productId: z.number().int().positive('ID de producto inválido'),
  quantity: z.number().min(1, 'Cantidad debe ser mayor a 0')
})

// Permitimos status en minúsculas del UI y lo mapeamos luego
const createOrderSchema = z.object({
  orderNumber: z.number().int().positive().optional(),
  personId: z.number().int().positive('ID de persona requerido'),
  employedId: z.number().int().positive().optional(),
  status: z.union([
    z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    z.enum(['pending', 'processing', 'completed', 'cancelled'])
  ]).optional(),
  items: z.array(orderItemSchema).min(1, 'Debe incluir al menos un item')
})

const updateOrderSchema = z.object({
  orderNumber: z.number().int().positive().optional(),
  personId: z.number().int().positive().optional(),
  employedId: z.number().int().positive().optional(),
  status: z.union([
    z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    z.enum(['pending', 'processing', 'completed', 'cancelled'])
  ]).optional(),
  items: z.array(orderItemSchema).optional()
})

// 📄 GET - Obtener todas las órdenes
export async function GET() {
  try {
    const supabase = createAdminClient()

    // 1) Órdenes
    const { data: orders, error: orderErr } = await supabase
      .from('Order')
      .select('id, orderNumber, personId, employedId, totalAmount, status')
      .order('id', { ascending: false })
    if (orderErr) throw orderErr

    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [] })
    }

  const orderRows = orders as OrderRow[]
  const orderIds = orderRows.map((o) => o.id)
  const personIds = Array.from(new Set(orderRows.map((o) => o.personId).filter((v): v is number => v != null)))
  const employedIds = Array.from(new Set(orderRows.map((o) => o.employedId).filter((v): v is number => v != null)))

    // 2) Personas (clientes)
  const personsById = new Map<number, PersonRow>()
    if (personIds.length) {
      const { data: persons, error } = await supabase
        .from('Person')
        .select('id, firstName, middleName, lastName, secondLastName, email')
        .in('id', personIds as number[])
      if (error) throw error
  ;(persons as PersonRow[] | null)?.forEach((p) => personsById.set(p.id, p))
    }

    // 3) Empleados básicos
  const employedById = new Map<number, EmployedRow>()
    if (employedIds.length) {
      const { data: employeds, error } = await supabase
        .from('Employed')
        .select('id, employedId, personId')
        .in('id', employedIds as number[])
      if (error) throw error
  ;(employeds as EmployedRow[] | null)?.forEach((e) => employedById.set(e.id, e))
    }

    // 4) Personas de empleados
    const employeePersonIds = Array.from(
      new Set(Array.from(employedById.values()).map((e) => e.personId).filter((v): v is number => v != null))
    )
    const employeePersonsById = new Map<number, PersonRow>()
    if (employeePersonIds.length) {
      const { data: empPersons, error } = await supabase
        .from('Person')
        .select('id, firstName, middleName, lastName, secondLastName')
        .in('id', employeePersonIds as number[])
      if (error) throw error
  ;(empPersons as PersonRow[] | null)?.forEach((p) => employeePersonsById.set(p.id, p))
    }

    // 5) Items de orden
    const { data: items, error: itemsErr } = await supabase
      .from('OrderItems')
      .select('id, orderId, productId, quantity')
      .in('orderId', orderIds as number[])
    if (itemsErr) throw itemsErr

    // 6) Productos
  const itemRows = (items || []) as OrderItemRow[]
  const productIds = Array.from(new Set(itemRows.map((it) => it.productId)))
  const productsById = new Map<number, ProductRow>()
    if (productIds.length) {
      const { data: products, error } = await supabase
        .from('Product')
        .select('id, name, price')
        .in('id', productIds as number[])
      if (error) throw error
  ;(products as ProductRow[] | null)?.forEach((p) => productsById.set(p.id, p))
    }

    // Indexar items por orden
  const itemsByOrderId = new Map<number, OrderItemRow[]>()
  ;(itemRows).forEach((it) => {
      const arr = itemsByOrderId.get(it.orderId) || []
      arr.push(it)
      itemsByOrderId.set(it.orderId, arr)
    })

    const statusMap: Record<string, 'pending' | 'processing' | 'completed' | 'cancelled'> = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      CONFIRMED: 'processing',
      SHIPPED: 'processing',
      DELIVERED: 'completed',
      CANCELLED: 'cancelled'
    }

  const uiOrders: UIOrder[] = orderRows.map((o) => {
      const person = personsById.get(o.personId)
      const employed = o.employedId ? employedById.get(o.employedId) : null
      const employedPerson = employed ? employeePersonsById.get(employed.personId) : null

      const fullName = [
        person?.firstName,
        person?.middleName,
        person?.lastName,
        person?.secondLastName
      ]
        .filter(Boolean)
        .join(' ')
        .trim()

      const employeeFullName = employedPerson
        ? [
            employedPerson.firstName,
            employedPerson.middleName,
            employedPerson.lastName,
            employedPerson.secondLastName
          ]
            .filter(Boolean)
            .join(' ')
            .trim()
        : ''

  const order_items: UIOrderItem[] = (itemsByOrderId.get(o.id) || []).map((it) => {
        const pr = productsById.get(it.productId)
        const unit_price = pr?.price != null ? parseFloat(String(pr.price)) : 0
        const subtotal = unit_price * it.quantity
        return {
          id: String(it.id),
          product_id: String(it.productId),
          product_name: pr?.name ?? '',
          quantity: it.quantity,
          unit_price,
          subtotal
        }
      })

  const subtotal = order_items.reduce((sum, i) => sum + i.subtotal, 0)
      const tax = subtotal * 0.13
      const total = subtotal + tax

      return {
        id: String(o.id),
        order_number: String(o.orderNumber),
        customer_id: String(o.personId),
        customer_name: fullName,
        customer_email: person?.email ?? '',
        assigned_employee_id: employed ? String(employed.employedId ?? employed.id) : undefined,
        assigned_employee_name: employed ? (employeeFullName || undefined) : undefined,
        subtotal,
        tax,
        total,
        notes: undefined,
        status: statusMap[o.status] ?? 'pending',
  created_at: '',
        order_items
      }
    })

    return NextResponse.json({ orders: uiOrders })

  } catch (error) {
    console.error('Error in GET /api/admin/orders (supabase):', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ➕ POST - Crear nueva orden
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos mínimos (sin exigir orderNumber ni totalAmount)
    const validatedData = createOrderSchema.parse(body)

    // Normalizar status del UI a enum de DB
    const mapUiToDbStatus = (s?: string) => {
      if (!s) return 'PENDING' as const
      const v = s.toUpperCase()
      if (v === 'PENDING' || v === 'CONFIRMED' || v === 'PROCESSING' || v === 'SHIPPED' || v === 'DELIVERED' || v === 'CANCELLED') {
        return v as typeof v
      }
      // desde UI
      switch (s) {
        case 'pending':
          return 'PENDING'
        case 'processing':
          return 'PROCESSING'
        case 'completed':
          return 'DELIVERED'
        case 'cancelled':
          return 'CANCELLED'
        default:
          return 'PENDING'
      }
    }
    const dbStatus = mapUiToDbStatus(validatedData.status as unknown as string | undefined)

    const supabase = createAdminClient()

    // Calcular siguiente número de orden si no se envía
    let nextOrderNumber = validatedData.orderNumber
    if (!nextOrderNumber) {
      const { data: lastOrders, error: lastErr } = await supabase
        .from('Order')
        .select('orderNumber')
        .order('orderNumber', { ascending: false })
        .limit(1)
      if (lastErr) throw lastErr
      const last = (lastOrders && (lastOrders as Pick<OrderRow,'orderNumber'>[])[0])
        ? Number((lastOrders as Pick<OrderRow,'orderNumber'>[])[0].orderNumber)
        : 0
      nextOrderNumber = (Number.isFinite(last) ? last : 0) + 1
    }

    // Obtener precios de productos
    const productIds = Array.from(new Set(validatedData.items.map(i => i.productId)))
    const { data: dbProducts, error: prodErr } = await supabase
      .from('Product')
      .select('id, price')
      .in('id', productIds)
    if (prodErr) throw prodErr
  const priceById = new Map(((dbProducts ?? []) as Pick<ProductRow,'id'|'price'>[]).map(p => [Number(p.id), Number(p.price)]))

    // Validar existencia y calcular subtotal
    let subtotal = 0
    for (const it of validatedData.items) {
      const unit = priceById.get(it.productId)
      if (unit == null) {
        return NextResponse.json(
          { error: `Producto ${it.productId} no encontrado` },
          { status: 400 }
        )
      }
      subtotal += unit * it.quantity
    }

    // Insertar la orden principal
    const { data: insertedOrders, error: insErr } = await supabase
      .from('Order')
      .insert({
        orderNumber: nextOrderNumber,
        personId: validatedData.personId,
        employedId: validatedData.employedId ?? null,
        totalAmount: subtotal,
        status: dbStatus
      })
      .select('id')
      .limit(1)
      .single()
    if (insErr) throw insErr

  const newOrderId = (insertedOrders as Pick<OrderRow,'id'>).id as number

    // Insertar los items de la orden
    const itemsPayload = validatedData.items.map(item => ({
      orderId: newOrderId,
      productId: item.productId,
      quantity: item.quantity
    }))
    const { error: itemsInsertErr } = await supabase
      .from('OrderItems')
      .insert(itemsPayload)
    if (itemsInsertErr) throw itemsInsertErr

    return NextResponse.json({
      message: 'Orden creada exitosamente',
      order: { id: newOrderId, orderNumber: nextOrderNumber }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/admin/orders:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ✏️ PUT - Actualizar orden existente
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('id')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de orden requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)

    const mapUiToDbStatus = (s?: string) => {
      if (!s) return undefined
      const v = s.toUpperCase()
      if (v === 'PENDING' || v === 'CONFIRMED' || v === 'PROCESSING' || v === 'SHIPPED' || v === 'DELIVERED' || v === 'CANCELLED') {
        return v as typeof v
      }
      switch (s) {
        case 'pending':
          return 'PENDING'
        case 'processing':
          return 'PROCESSING'
        case 'completed':
          return 'DELIVERED'
        case 'cancelled':
          return 'CANCELLED'
        default:
          return undefined
      }
    }

    const supabase = createAdminClient()

    // Actualizar la orden
    const result = await (async () => {
      // Actualizar la orden
  const updateData: Record<string, unknown> = {}
      
      if (validatedData.orderNumber !== undefined) updateData.orderNumber = validatedData.orderNumber
      if (validatedData.personId !== undefined) updateData.personId = validatedData.personId
      if (validatedData.employedId !== undefined) updateData.employedId = validatedData.employedId
  const mapped = mapUiToDbStatus(validatedData.status as unknown as string | undefined)
  if (mapped !== undefined) updateData.status = mapped

      if (Object.keys(updateData).length > 0) {
        const { error: updErr } = await supabase
          .from('Order')
          .update(updateData)
          .eq('id', parseInt(orderId))
        if (updErr) throw updErr
      }

      // Si se proporcionaron nuevos items, actualizarlos
      if (validatedData.items) {
        // Eliminar items existentes
        const { error: delErr } = await supabase
          .from('OrderItems')
          .delete()
          .eq('orderId', parseInt(orderId))
        if (delErr) throw delErr

        // Crear nuevos items
        const newItems = validatedData.items.map(item => ({
          orderId: parseInt(orderId),
          productId: item.productId,
          quantity: item.quantity
        }))
        const { error: insItemsErr } = await supabase
          .from('OrderItems')
          .insert(newItems)
        if (insItemsErr) throw insItemsErr

        // Recalcular totalAmount basado en los nuevos items
        const productIds = Array.from(new Set(validatedData.items.map(i => i.productId)))
        const { data: dbProducts, error: prodErr } = await supabase
          .from('Product')
          .select('id, price')
          .in('id', productIds)
        if (prodErr) throw prodErr
  const priceById = new Map(((dbProducts ?? []) as Pick<ProductRow,'id'|'price'>[]).map(p => [Number(p.id), Number(p.price)]))
        let subtotal = 0
        for (const it of validatedData.items) {
          const unit = priceById.get(it.productId) || 0
          subtotal += unit * it.quantity
        }
        const { error: updTotalErr } = await supabase
          .from('Order')
          .update({ totalAmount: subtotal })
          .eq('id', parseInt(orderId))
        if (updTotalErr) throw updTotalErr
      }

      return { id: parseInt(orderId) }
    })()

    return NextResponse.json({
      message: 'Orden actualizada exitosamente',
      order: result
    })

  } catch (error) {
    console.error('Error in PUT /api/admin/orders:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// 🗑️ DELETE - Eliminar orden
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('id')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de orden requerido' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    // Eliminar items de la orden primero
    const { error: delItemsErr } = await supabase
      .from('OrderItems')
      .delete()
      .eq('orderId', parseInt(orderId))
    if (delItemsErr) throw delItemsErr

    // Eliminar la orden
    const { error: delOrderErr } = await supabase
      .from('Order')
      .delete()
      .eq('id', parseInt(orderId))
    if (delOrderErr) throw delOrderErr

    return NextResponse.json({
      message: 'Orden eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
