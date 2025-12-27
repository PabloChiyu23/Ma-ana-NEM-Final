# Configuración de Variables de Entorno en Vercel

## 🚨 Problema Común

Si ves el error: **"API Key de Gemini no configurada"** en producción, es porque las variables de entorno no están configuradas en Vercel.

## ✅ Solución: Configurar Variables en Vercel

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a tu proyecto en Vercel**
   - Accede a [vercel.com](https://vercel.com)
   - Selecciona tu proyecto `Ma-ana-NEM-Final`

2. **Ve a Settings → Environment Variables**
   - En el menú lateral, haz clic en **Settings**
   - Luego en **Environment Variables**

3. **Agrega las variables**
   
   Agrega estas variables:
   
   | Key | Value | Environment |
   |-----|-------|-------------|
   | `VITE_GEMINI_API_KEY` | `tu-api-key-de-gemini` | Production, Preview, Development |

   ⚠️ **Importante**: Usa el prefijo `VITE_` porque es un proyecto Vite.

4. **Guarda y redespliega**
   - Haz clic en **Save**
   - Ve a **Deployments**
   - En el último deployment, haz clic en los tres puntos (⋯) → **Redeploy**

### Opción 2: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Configurar la variable
vercel env add VITE_GEMINI_API_KEY

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

⚠️ **NUNCA** comitas tu API key al repositorio. Ya está protegida en `.gitignore`.

✅ La variable `VITE_GEMINI_API_KEY` solo es accesible en el cliente (navegador). Esto es necesario porque la aplicación hace las llamadas directamente desde el navegador.

## 📝 Verificar que Funciona

Después de configurar y redesplegar:

1. Ve a tu aplicación en Vercel
2. Abre la consola del navegador (F12)
3. Intenta generar una planeación
4. No deberías ver el error de "API Key no configurada"

## 🐛 Troubleshooting

### Error persiste después de configurar

1. **Verifica que la variable tenga el prefijo `VITE_`**
   - Vite solo expone variables con este prefijo al cliente
   
2. **Redespliega manualmente**
   - A veces Vercel necesita un redeploy para cargar nuevas variables
   
3. **Verifica el nombre exacto**
   - Debe ser exactamente: `VITE_GEMINI_API_KEY` (mayúsculas)

4. **Limpia la caché**
   - En Vercel: Settings → General → Clear Build Cache
   - Luego haz un nuevo deploy

### Variables no se cargan en desarrollo local

Si estás probando localmente, crea un archivo `.env.local`:

```env
VITE_GEMINI_API_KEY=tu-api-key-aqui
```

Luego reinicia el servidor de desarrollo:
```bash
npm run dev
```

## 📚 Recursos

- [Documentación de Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

