import { NextRequest } from 'next/server'
import { streamText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { createOpenAI } from '@ai-sdk/openai'
import { createAdminClient } from '@/lib/supabase/admin'

// Usa OPENAI_API_KEY desde variables de entorno
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response('Falta OPENAI_API_KEY en variables de entorno', { status: 500 })
  }
  try {
    const { messages, system, model: modelName } = await req.json()

    // Traer CompanySettings desde Supabase para contextualizar al agente
    let companySystem = ''
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from('CompanySettings')
        .select('name, description, personality, salesMessaging')
        .order('id', { ascending: true })
        .limit(1)
      if (error) throw error
      const s = data?.[0] as { name?: string; description?: string; personality?: string; salesMessaging?: string } | undefined
      if (s) {
        companySystem = [
          s.name ? `Nombre de la empresa: ${s.name}` : null,
          s.description ? `Descripción: ${s.description}` : null,
          s.personality ? `Personalidad de marca: ${s.personality}` : null,
          s.salesMessaging ? `Mensajería de ventas: ${s.salesMessaging}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      }
    } catch (e) {
      // No bloquear el chat si falla este fetch
      console.warn('No se pudo cargar CompanySettings para el chat:', e)
    }

    const model = openai.chat(modelName || 'gpt-4o-mini')

    // Tipos auxiliares para resultados de Supabase
    type ProductRow = { id: number; name: string; price: number | string; stock: number | null; categoryId: number }
    type OrderItemWithProduct = {
      id: number
      productId: number
      quantity: number
      product: { id: number; name: string; price: number | string } | null
    }

    // Definir herramientas que consultan tu base en Supabase
    const tools = {
      searchProductsByName: tool({
        description: 'Buscar productos por nombre (búsqueda parcial, sin distinción de mayúsculas).',
        inputSchema: z.object({
          name: z.string().min(1).describe('Texto a buscar en el nombre del producto'),
          limit: z.number().int().min(1).max(50).default(10).describe('Máximo de resultados'),
        }),
        execute: async ({ name, limit }) => {
          const supabase = createAdminClient()
          const { data, error } = await supabase
            .from('Product')
            .select('id, name, price, stock, categoryId')
            .ilike('name', `%${name}%`)
            .limit(limit ?? 10)
          if (error) throw error
          const rows = (data ?? []) as unknown as ProductRow[]
          return rows.map((p) => ({
            id: p.id,
            name: p.name,
            price: typeof p.price === 'string' ? Number(p.price) : p.price,
            stock: p.stock ?? 0,
            categoryId: p.categoryId,
          }))
        },
      }),

      getProductStock: tool({
        description: 'Obtener stock y nombre de un producto por su ID.',
        inputSchema: z.object({ productId: z.number().int().positive() }),
        execute: async ({ productId }) => {
          const supabase = createAdminClient()
          const { data, error } = await supabase
            .from('Product')
            .select('id, name, stock')
            .eq('id', productId)
            .maybeSingle()
          if (error) throw error
          if (!data) return { found: false }
          return { found: true, id: data.id, name: data.name, stock: data.stock ?? 0 }
        },
      }),

      getOrderByNumber: tool({
        description: 'Trae un pedido por su número, con ítems y totales.',
        inputSchema: z.object({ orderNumber: z.number().int().positive() }),
        execute: async ({ orderNumber }) => {
          const supabase = createAdminClient()
          const { data: order, error: orderErr } = await supabase
            .from('Order')
            .select('id, orderNumber, personId, employedId, totalAmount, status')
            .eq('orderNumber', orderNumber)
            .maybeSingle()
          if (orderErr) throw orderErr
          if (!order) return { found: false }

          const { data: items, error: itemsErr } = await supabase
            .from('OrderItems')
            .select('id, productId, quantity, product:Product(id, name, price)')
            .eq('orderId', order.id)
          if (itemsErr) throw itemsErr

          const rows = (items ?? []) as unknown as OrderItemWithProduct[]
          const mappedItems = rows.map((it) => ({
            id: it.id,
            productId: it.productId,
            quantity: it.quantity,
            product: it.product
              ? {
                  id: it.product.id,
                  name: it.product.name,
                  price: typeof it.product.price === 'string' ? Number(it.product.price) : it.product.price,
                }
              : null,
          }))

          return {
            found: true,
            order: {
              id: order.id,
              orderNumber: order.orderNumber,
              personId: order.personId,
              employedId: order.employedId,
              totalAmount: typeof order.totalAmount === 'string' ? Number(order.totalAmount) : order.totalAmount,
              status: order.status,
              items: mappedItems,
            },
          }
        },
      }),

      getCustomerByEmail: tool({
        description: 'Obtener persona (cliente) por email exacto.',
        inputSchema: z.object({ email: z.string().email() }),
        execute: async ({ email }) => {
          const supabase = createAdminClient()
          const { data, error } = await supabase
            .from('Person')
            .select('id, firstName, lastName, email, phoneNumber')
            .eq('email', email)
            .maybeSingle()
          if (error) throw error
          if (!data) return { found: false }
          return { found: true, person: data }
        },
      }),

      getCompanySettings: tool({
        description: 'Obtener la configuración de la empresa (CompanySettings).',
        inputSchema: z.object({}),
        execute: async () => {
          const supabase = createAdminClient()
          const { data, error } = await supabase
            .from('CompanySettings')
            .select('id, name, description, personality, salesMessaging')
            .order('id', { ascending: true })
            .limit(1)
          if (error) throw error
          const s = data?.[0]
          return s ? { found: true, settings: s } : { found: false }
        },
      }),
    } as const

    const result = await streamText({
      model,
      messages,
      system:
        (system as string | undefined) ||
        `Eres un asistente útil para un ERP de ventas. Responde de forma breve y clara en español.
${companySystem ? `\nContexto de la empresa:\n${companySystem}` : ''}`
      ,
      tools,
      stopWhen: stepCountIs(5),
    })

  // Responder como Text Stream (compatible con TextStreamChatTransport)
  return result.toTextStreamResponse()
  } catch (err) {
    console.error('Chat API error:', err)
    return new Response('Error al procesar el chat', { status: 500 })
  }
}
