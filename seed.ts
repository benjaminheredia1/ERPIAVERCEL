import { PrismaClient } from './src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories first
  const electronicCategory = await prisma.category.create({
    data: {
      name: 'Electrónicos',
      description: 'Dispositivos electrónicos y gadgets'
    }
  })
  
  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Ropa',
      description: 'Vestimenta y accesorios'
    }
  })
  
  const homeCategory = await prisma.category.create({
    data: {
      name: 'Hogar',
      description: 'Artículos para el hogar'
    }
  })
  
  const sportsCategory = await prisma.category.create({
    data: {
      name: 'Deportes',
      description: 'Equipamiento deportivo'
    }
  })

  console.log('✅ Categories created')

  // Now create products
  console.log('Creating products...')
  
  await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      description: 'El último smartphone de Apple con chip A17 Pro',
      price: 999.99,
      stock: 25,
      categoryId: electronicCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'
    }
  })
  
  await prisma.product.create({
    data: {
      name: 'MacBook Air M3',
      description: 'Laptop ultradelgada con chip M3 de Apple',
      price: 1299.99,
      stock: 15,
      categoryId: electronicCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'
    }
  })
  
  await prisma.product.create({
    data: {
      name: 'Camiseta Premium',
      description: 'Camiseta de algodón 100% orgánico',
      price: 29.99,
      stock: 100,
      categoryId: clothingCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
    }
  })
  
  await prisma.product.create({
    data: {
      name: 'Jeans Denim',
      description: 'Jeans clásicos de mezclilla azul',
      price: 79.99,
      stock: 50,
      categoryId: clothingCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'
    }
  })
  
  await prisma.product.create({
    data: {
      name: 'Sofá Moderno',
      description: 'Sofá de 3 plazas tapizado en tela gris',
      price: 799.99,
      stock: 8,
      categoryId: homeCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
    }
  })
  
  await prisma.product.create({
    data: {
      name: 'Bicicleta de Montaña',
      description: 'Bicicleta todo terreno con suspensión completa',
      price: 1299.99,
      stock: 5,
      categoryId: sportsCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1544191696-15693072e0b0?w=500'
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created 4 categories`)
  console.log(`Created 6 products`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
