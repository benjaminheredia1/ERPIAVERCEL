# 🚀 Guía de Configuración Rápida - Sistema de Órdenes

## ⚡ Configuración en 5 minutos

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Crea una cuenta o inicia sesión
4. Haz clic en **"New Project"**
5. Llena los datos:
   - **Name**: ERP Ventas
   - **Database Password**: (crea una contraseña segura)
   - **Region**: Selecciona la más cercana
6. Haz clic en **"Create new project"**
7. Espera 2-3 minutos a que se configure

### 2. Obtener Credenciales de API
1. En tu proyecto de Supabase, ve a **Settings** (⚙️)
2. En el menú lateral, haz clic en **API**
3. Copia los siguientes valores:
   - **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - **anon/public key** (una clave larga que empieza con `eyJ...`)
   - **service_role key** (⚠️ mantén esta secreta)

### 3. Configurar Variables de Entorno
✅ **Ya está configurado** - Todas las variables están en el archivo `.env`

Tu configuración actual:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qeohmikhaokypldysrqb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_configurada
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_configurada
```

💡 **No necesitas cambiar nada aquí** - tu Supabase ya está funcionando correctamente.

### 4. Crear Tablas en Supabase
1. En Supabase, ve a **SQL Editor** (📄)
2. Haz clic en **"New query"**
3. Abre el archivo `database/orders_schema.sql` de tu proyecto
4. Copia TODO el contenido del archivo
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **"Run"** ▶️
7. Verifica que aparezca ✅ "Success. No rows returned"

### 5. Verificar las Tablas
1. Ve a **Table Editor** en Supabase
2. Deberías ver 4 tablas creadas:
   - `products` (5 productos de ejemplo)
   - `customers` (5 clientes de ejemplo)
   - `orders` (vacía, lista para usar)
   - `order_items` (vacía, lista para usar)

### 6. Reiniciar el Servidor
1. En tu terminal, presiona `Ctrl+C` para detener el servidor
2. Ejecuta: `npm run dev`
3. Ve a `http://localhost:3000/admin/orders`

## ✅ ¡Listo!

Tu sistema de órdenes debería estar funcionando completamente:
- Crear órdenes con múltiples productos
- Asignar empleados opcionales
- Calcular totales automáticamente
- Buscar y filtrar órdenes
- Ver estadísticas en tiempo real

## 🔧 Solución de Problemas

### Error: "Could not find the table 'public.orders'"
- ✅ Verifica que ejecutaste el script SQL completo
- ✅ Revisa que las 4 tablas existan en Table Editor
- ✅ Asegúrate de que las variables de entorno sean correctas

### Error: "Invalid API key"
- ✅ Verifica que copiaste las claves correctamente
- ✅ No debe haber espacios extra al inicio o final
- ✅ Reinicia el servidor después de cambiar .env.local

### Las tablas están vacías
- ✅ El script SQL incluye datos de ejemplo
- ✅ Ejecuta solo la parte de INSERT del script si es necesario

## 📞 ¿Necesitas ayuda?
Si tienes problemas, verifica:
1. Que Supabase esté completamente configurado (proyecto verde ✅)
2. Que las variables de entorno estén correctas
3. Que el script SQL se haya ejecutado sin errores
4. Que el servidor esté reiniciado después de los cambios
