# Configuración de Variables de Entorno en Vercel

## 🔒 Seguridad Mejorada

**IMPORTANTE**: La aplicación ahora usa una **API serverless** para llamar a Gemini. La API key está protegida en el servidor y **NO se expone al cliente**.

## 🚨 Problema Común

Si ves el error: **"API Key de Gemini no configurada"** en producción, es porque la variable de entorno no está configurada en Vercel.

## ✅ Solución: Configurar Variables en Vercel

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a tu proyecto en Vercel**
   - Accede a [vercel.com](https://vercel.com)
   - Selecciona tu proyecto `Ma-ana-NEM-Final`

2. **Ve a Settings → Environment Variables**
   - En el menú lateral, haz clic en **Settings**
   - Luego en **Environment Variables**

3. **Agrega la variable (SIN prefijo VITE_)**
   
   Agrega esta variable:
   
   | Key | Value | Environment |
   |-----|-------|-------------|
   | `GEMINI_API_KEY` | `tu-api-key-de-gemini` | Production, Preview, Development |

   ⚠️ **IMPORTANTE**: 
   - **NO** uses el prefijo `VITE_` porque esta variable solo está en el servidor
   - La API key está protegida y no se expone al navegador

4. **Guarda y redespliega**
   - Haz clic en **Save**
   - Ve a **Deployments**
   - En el último deployment, haz clic en los tres puntos (⋯) → **Redeploy**

### Opción 2: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Configurar la variable (SIN prefijo VITE_)
vercel env add GEMINI_API_KEY

# Cuando te pregunte, selecciona:
# - Para Production: Yes
# - Para Preview: Yes  
# - Para Development: Yes
# - Value: Pega tu API key de Gemini

# Redesplegar
vercel --prod
```

## 🔑 Obtener tu API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **Create API Key**
4. Selecciona tu proyecto o crea uno nuevo
5. Copia la API key generada

## 🔒 Seguridad

✅ **API Key Protegida**: La API key de Gemini ahora está en el servidor (API serverless) y **NUNCA** se expone al navegador.

⚠️ **NUNCA** comitas tu API key al repositorio. Ya está protegida en `.gitignore`.

✅ **Arquitectura segura**:
- El frontend hace requests a `/api/gemini` (tu API interna)
- La API serverless en Vercel usa `GEMINI_API_KEY` (solo en servidor)
- La API key nunca llega al cliente

## 📝 Verificar que Funciona

Después de configurar y redesplegar:

1. Ve a tu aplicación en Vercel
2. Abre la consola del navegador (F12)
3. Intenta generar una planeación
4. No deberías ver el error de "API Key no configurada"

## 🐛 Troubleshooting

### Error persiste después de configurar

1. **Verifica el nombre de la variable**
   - Debe ser exactamente: `GEMINI_API_KEY` (SIN prefijo `VITE_`)
   - Esta variable solo existe en el servidor
   
2. **Redespliega manualmente**
   - A veces Vercel necesita un redeploy para cargar nuevas variables
   - Ve a Deployments → Redeploy

3. **Verifica que la función serverless funcione**
   - La API está en `/api/gemini.ts`
   - Vercel debería detectarla automáticamente

4. **Limpia la caché**
   - En Vercel: Settings → General → Clear Build Cache
   - Luego haz un nuevo deploy

### Desarrollo local

Para desarrollo local, necesitas ejecutar las funciones serverless. Tienes dos opciones:

**Opción 1: Usar Vercel CLI (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Ejecutar en modo desarrollo
vercel dev
```

**Opción 2: Variables de entorno locales**
Crea un archivo `.env.local`:
```env
GEMINI_API_KEY=tu-api-key-aqui
```

Luego usa `vercel dev` para que las funciones serverless funcionen localmente.

## 📚 Recursos

- [Documentación de Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

