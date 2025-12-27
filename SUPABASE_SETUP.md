# Configuración de Supabase para MAÑANA

Este documento explica cómo configurar la base de datos Supabase para la aplicación MAÑANA.

## 📋 Prerequisitos

1. Una cuenta en [Supabase](https://supabase.com)
2. Un proyecto creado en Supabase

## 🚀 Pasos de Instalación

### 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Anota tu **URL del proyecto** y la **API Key** (anon/public key)

### 2. Ejecutar el script SQL

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase_schema.sql`
3. Copia todo el contenido y pégalo en el SQL Editor
4. Haz clic en **Run** (o presiona `Cmd/Ctrl + Enter`)

### 3. Configurar variables de entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Instalar el cliente de Supabase

```bash
npm install @supabase/supabase-js
```

## 📊 Estructura de las Tablas

### `users`
Almacena información básica de los usuarios:
- `id`: UUID único
- `email`: Email del usuario (único)
- `is_pro`: Boolean, indica si tiene membresía PRO
- `total_generations`: Contador de generaciones realizadas
- `created_at`, `updated_at`: Timestamps

### `saved_lessons`
Almacena las lecciones guardadas (favoritos):
- Todos los parámetros de la lección (grade, topic, duration, status, tone, group_size)
- `content`: Contenido completo de la planeación generada
- `user_id`: Referencia al usuario que la guardó

### `lesson_generations` (Opcional)
Historial de todas las generaciones para analytics:
- Parámetros usados
- Contenido generado
- Estado (success/error)

### `subscriptions` (Opcional)
Manejo de suscripciones PRO:
- Estado de la suscripción
- Fechas de inicio y expiración
- Información de cancelación

## 🔒 Seguridad (RLS)

El script incluye Row Level Security (RLS) configurado para que:
- Los usuarios solo puedan ver y editar sus propios datos
- Las lecciones solo sean accesibles por su dueño
- Las políticas verifican el email del usuario autenticado

## 🔧 Funciones Útiles

### `get_or_create_user(email)`
Obtiene un usuario existente o lo crea si no existe. Retorna el UUID.

```sql
SELECT get_or_create_user('usuario@ejemplo.com');
```

### `increment_user_generations(email)`
Incrementa el contador de generaciones de un usuario.

```sql
SELECT increment_user_generations('usuario@ejemplo.com');
```

### `is_user_pro(email)`
Verifica si un usuario tiene membresía PRO activa.

```sql
SELECT is_user_pro('usuario@ejemplo.com');
```

## 📝 Notas Importantes

1. **RLS está habilitado**: Todas las tablas tienen Row Level Security activado. Asegúrate de configurar la autenticación correctamente en tu aplicación.

2. **UUIDs**: El script usa UUIDs en lugar de IDs numéricos para mejor seguridad y escalabilidad.

3. **Constraints**: Se incluyen CHECK constraints para validar que los valores de `grade`, `duration`, `status`, `tone` y `group_size` sean válidos según los tipos TypeScript.

4. **Triggers**: Los timestamps `updated_at` se actualizan automáticamente cuando se modifica un registro.

## 🔄 Migración desde localStorage

Si ya tienes datos en localStorage, necesitarás crear un script de migración que:

1. Obtenga el email del usuario
2. Cree o actualice el usuario en Supabase
3. Migre las lecciones guardadas
4. Actualice el contador de generaciones

## 🆘 Solución de Problemas

### Error: "permission denied for table"
- Verifica que las políticas RLS estén correctamente configuradas
- Asegúrate de que el usuario esté autenticado

### Error: "duplicate key value violates unique constraint"
- El email ya existe en la tabla users
- Usa `get_or_create_user()` en lugar de INSERT directo

### Error: "check constraint violation"
- Los valores de grade, duration, status, tone o group_size no son válidos
- Verifica que coincidan con los tipos definidos en `types.ts`

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

