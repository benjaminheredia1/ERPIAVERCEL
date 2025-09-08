# 🔍 Implementación de Zod para Validación de Contraseñas

## ¿Qué es Zod?

Zod es una biblioteca de **TypeScript-first schema validation**. Permite:
- Validar datos en tiempo de ejecución
- Inferir automáticamente tipos de TypeScript
- Crear schemas reutilizables y composables
- Proporcionar mensajes de error personalizados

## 🚀 Implementación en el Proyecto

### 1. Instalación
```bash
npm install zod
```

### 2. Schema de Validación

```typescript
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
})
```

### 3. Inferencia de Tipos
```typescript
type PasswordForm = z.infer<typeof passwordSchema>
// Automáticamente genera:
// {
//   password: string;
//   confirmPassword: string;
// }
```

### 4. Función de Validación
```typescript
const validateForm = (data: PasswordForm) => {
  try {
    passwordSchema.parse(data)  // 🟢 Validación exitosa
    setErrors({})
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 🔴 Captura errores específicos
      const fieldErrors: Partial<Record<keyof PasswordForm, string>> = {}
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof PasswordForm] = issue.message
        }
      })
      setErrors(fieldErrors)
    }
    return false
  }
}
```

## 🎯 Beneficios de esta Implementación

### ✅ Validación Robusta
- **Longitud mínima**: 8 caracteres
- **Complejidad**: Mayúsculas, minúsculas, números, símbolos
- **Confirmación**: Validación cruzada entre campos

### ✅ Experiencia de Usuario Mejorada
- **Feedback en tiempo real**: Validación mientras escribes
- **Indicadores visuales**: Checkmarks verdes para requisitos cumplidos
- **Mensajes específicos**: Errores detallados por campo

### ✅ Desarrollo Type-Safe
- **Tipos automáticos**: No necesitas escribir interfaces manualmente
- **Autocomplete**: IntelliSense completo en VS Code
- **Error de compilación**: Detecta problemas antes del runtime

## 📋 Características Avanzadas Utilizadas

### 1. `.refine()` - Validaciones Personalizadas
```typescript
.refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]  // 🎯 Asigna error a campo específico
})
```

### 2. `.regex()` - Validaciones con Expresiones Regulares
```typescript
.regex(/[A-Z]/, "Debe contener al menos una mayúscula")
.regex(/[0-9]/, "Debe contener al menos un número")
```

### 3. Manejo de Errores Estructurado
```typescript
error.issues.forEach((issue) => {
  // issue.path[0] = nombre del campo
  // issue.message = mensaje de error personalizado
})
```

## 🔧 Casos de Uso Comunes

### Validación Inmediata
```typescript
const handlePasswordChange = (value: string) => {
  setPassword(value)
  if (value || confirmPassword) {
    validateForm({ password: value, confirmPassword })
  }
}
```

### Validación Antes del Envío
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm({ password, confirmPassword })) {
    toast.error('Por favor corrige los errores')
    return
  }
  
  // ✅ Proceder con datos validados
}
```

### Deshabilitar Botón con Errores
```typescript
<Button 
  disabled={loading || Object.keys(errors).length > 0}
>
  Establecer Contraseña
</Button>
```

## 🚀 Escalabilidad

Este patrón se puede extender fácilmente:

```typescript
// Para formularios de registro
const registerSchema = z.object({
  firstName: z.string().min(2, "Nombre muy corto"),
  lastName: z.string().min(2, "Apellido muy corto"),
  email: z.string().email("Email inválido"),
  password: passwordSchema.shape.password,
  confirmPassword: z.string()
}).refine(/* validaciones cruzadas */)

// Para configuraciones
const settingsSchema = z.object({
  theme: z.enum(["light", "dark"]),
  notifications: z.boolean(),
  language: z.string().default("es")
})
```

## 💡 Próximos Pasos

- **Validación del lado servidor**: Usar el mismo schema en APIs
- **Validación asíncrona**: Verificar emails únicos
- **Schemas complejos**: Validaciones condicionales
- **Internacionalización**: Mensajes multi-idioma
