# 🔌 Frontend Conectado a Supabase

## C3 Nicaragua - Guía de uso

---

## ✅ Lo que ya está conectado

El frontend ya no usa datos hardcodeados. Ahora todo se conecta a tu Supabase:

```
Frontend (Vite/React)
    ↓
Supabase Client (@supabase/supabase-js)
    ↓
Supabase (https://qyxusoqxwplzvftuumpb.supabase.co)
    ├── Auth (login admin)
    ├── PostgreSQL (productos, cotizaciones, config)
    └── Storage (imágenes de productos)
```

---

## 🔐 Credenciales de Supabase configuradas

Archivo `.env`:
```
VITE_SUPABASE_URL=https://qyxusoqxwplzvftuumpb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

> ⚠️ Estas credenciales son **públicas** (la anon key puede ser vista por cualquiera). La seguridad real la da el **RLS** que configuraste en Supabase.

---

## 📁 Archivos nuevos del frontend

```
src/
├── lib/
│   └── supabase.ts              # Cliente Supabase configurado
├── services/
│   ├── products.ts              # CRUD de productos
│   ├── quotations.ts            # CRUD de cotizaciones
│   ├── auth.ts                  # Login/logout
│   └── config.ts                # Configuración del sitio
└── store/
    └── index.tsx                # Store refactorizado con Supabase
```

---

## 🛍️ Flujo de datos por pantalla

### **Catálogo público (Home, Catálogo, Producto)**
1. Carga inicial: `supabase.from('products').select('*, brand:brands(*), category:categories(*)')`
2. Si falla o no hay datos: usa el seed local (`src/data/products.ts`)
3. Filtros y búsqueda se hacen **en el cliente** sobre los productos ya cargados
4. Solo productos con `is_active = true` se muestran al público

### **Checkout (cliente envía cotización)**
1. Cliente completa el formulario
2. `addQuotation()` ejecuta `supabase.from('quotations').insert(...)`
3. Luego `supabase.from('quotation_items').insert(items)`
4. Se abre WhatsApp con el mensaje prellenado
5. (Opcional) Edge Function envía email al agente
6. Cotización queda guardada en Supabase con `status = 'nueva'`

### **Login admin (`/admin/login`)**
1. Usuario ingresa email y contraseña
2. `supabase.auth.signInWithPassword(email, password)`
3. Se obtiene el perfil de `public.profiles`
4. Si el rol es `admin`/`agente`/`supervisor`, se permite acceso
5. Sesión persiste automáticamente (Supabase maneja el JWT)

### **Panel admin - Cotizaciones**
1. Al autenticarse, carga: `supabase.from('quotations').select('*, items:quotation_items(*)')`
2. Cambiar estado: `supabase.from('quotations').update({status, contacted_at})`
3. Eliminar: `supabase.from('quotations').delete()`

### **Panel admin - Productos**
1. Carga: `supabase.from('products').select(...)`
2. Crear: `supabase.from('products').insert([...])`
3. Editar: `supabase.from('products').update(...).eq('id', ...)`
4. Eliminar: `supabase.from('products').delete().eq('id', ...)`
5. Subir imagen: `supabase.storage.from('product-images').upload(...)`

---

## 🚀 Cómo usar el sistema ahora

### 1. Crear el usuario admin en Supabase

Ve a tu dashboard de Supabase:
- **Authentication > Users > Add user**
- Email: `admin@c3nicaragua.com`
- Password: la que prefieras (ej: `C3Nicaragua2026!`)
- ✅ Auto Confirm User

El trigger `on_auth_user_created` creará automáticamente el perfil con rol `agente`.

### 2. Cambiar el rol a admin

Ejecuta en SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'admin@c3nicaragua.com'
);
```

### 3. Crear el bucket de imágenes

Ve a **Storage > New bucket**:
- Name: `product-images`
- Public: ✅ Activar

Aplica las políticas (ver documento 05, sección 6).

### 4. Login en el frontend

1. Ve a `https://tu-dominio.com/admin/login`
2. Ingresa el email y contraseña del paso 1
3. ¡Listo! Ya tienes acceso al panel

---

## 🔍 Verificar la conexión

### En la consola del navegador

Abre DevTools > Console y verás mensajes como:
- `✅ Productos cargados desde Supabase: 21`
- `✅ Sesión verificada`
- `✅ Cotización creada: COT-LXK2K9`

### En Supabase Dashboard

**Table Editor > quotations** → verás cada cotización nueva con su `customer_name`, `phone`, `total`, `status`, etc.

**Table Editor > quotation_items** → verás los items asociados a cada cotización.

**Storage > product-images** → verás las imágenes que subas desde el panel admin.

---

## 🛡️ Seguridad (RLS)

Las políticas que configuraste en Supabase protegen los datos:

| Acción | ¿Quién puede? |
|---|---|
| **Ver productos activos** | Todos (público) |
| **Crear cotización** | Todos (público) |
| **Ver cotizaciones** | Solo admin autenticado |
| **Editar cotizaciones** | Solo admin autenticado |
| **Crear/editar productos** | Solo admin autenticado |
| **Ver config** | Todos (vía vista `public_config`) |
| **Editar config** | Solo admin autenticado |
| **Subir imágenes** | Solo admin autenticado |

---

## 🔄 Realtime (opcional)

Para habilitar cotizaciones en vivo en el panel admin:

```sql
alter publication supabase_realtime add table public.quotations;
```

Luego en el frontend puedes suscribirte:

```typescript
supabase
  .channel('quotations')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quotations' },
    (payload) => {
      // Reproducir sonido, mostrar notificación
      console.log('¡Nueva cotización!', payload.new);
    }
  )
  .subscribe();
```

---

## 📧 Notificaciones por email (opcional)

### Opción 1: Edge Function + Resend

Despliega la función (ver documento 05, sección 8):
```bash
supabase functions deploy send-quotation-email
```

Configura los secretos:
```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set SALES_EMAIL=ventas@c3nicaragua.com
```

Crea el webhook en **Database > Webhooks**:
- Trigger: INSERT en `quotations`
- Acción: llamar a la Edge Function

### Opción 2: EmailJS (frontend)

Mantén la lógica actual con EmailJS + Resend. No requiere backend.

---

## 🐛 Solución de problemas

### ❌ "Failed to fetch" o error de red
- Verifica que tu `.env` tiene las credenciales correctas
- Reinicia el servidor de desarrollo

### ❌ "permission denied for table"
- Revisa las políticas RLS en Supabase
- Verifica que tu usuario admin tiene `role = 'admin'` en `profiles`

### ❌ "Invalid login credentials"
- Verifica que el email y contraseña son correctos
- Asegúrate de que el usuario está creado y confirmado

### ❌ "Bucket not found"
- Crea el bucket `product-images` en Storage
- Marca como público

### ❌ Las cotizaciones no aparecen
- Verifica que el admin está autenticado (debe ver el sidebar del panel)
- Revisa la consola del navegador por errores
- Verifica en Supabase > Table Editor > quotations

---

## 📊 Monitoreo

Ve a **Supabase > Reports** para ver:
- Conexiones activas
- Queries por minuto
- Storage usado
- Bandwidth

En el **Free tier** tienes:
- 500 MB de base de datos
- 1 GB de storage
- 2 GB de transferencia/mes
- 50,000 usuarios activos

---

## ✅ Checklist de despliegue

- [ ] `.env` configurado con tus credenciales
- [ ] Tablas creadas en Supabase (ver doc 05, sección 3)
- [ ] Datos seed insertados (ver doc 05, sección 4)
- [ ] RLS configurado (ver doc 05, sección 5)
- [ ] Bucket `product-images` creado
- [ ] Usuario admin creado en Authentication
- [ ] Rol del usuario cambiado a `admin`
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Probado: crear cotización desde el frontend
- [ ] Verificado: cotización aparece en Supabase
- [ ] Verificado: admin puede ver cotizaciones

---

**🎉 ¡Tu catálogo C3 Nicaragua está conectado a Supabase!**
