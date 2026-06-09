# ⚡ Edge Functions + Realtime + Email

## C3 Nicaragua - Despliegue de funciones serverless

---

## ✅ Lo que se implementó

1. ✅ **Edge Function** `send-quotation-email` creada en `supabase/functions/`
2. ✅ **Realtime** suscrito en el panel de cotizaciones (con alerta visual y sonido)
3. ✅ **Frontend** llama a la Edge Function al crear cotización
4. ✅ **Email HTML** con branding de C3 Nicaragua (gradiente, logo, botones)

---

## 📧 1. Edge Function: send-quotation-email

### Ubicación
```
supabase/functions/send-quotation-email/index.ts
```

### ¿Qué hace?
Cuando se crea una nueva cotización, esta función serverless:
1. Recibe los datos de la cotización
2. Construye un email HTML profesional con el branding de C3
3. Lo envía al email del agente (configurable) usando Resend

### Despliegue (paso a paso)

#### Paso 1: Instalar Supabase CLI (si no lo tienes)

```bash
# macOS
brew install supabase/tap/supabase

# Windows con Scoop
scoop install supabase

# Con npm (cualquier OS)
npm install -g supabase
```

#### Paso 2: Login en Supabase

```bash
supabase login
```

Se abrirá tu navegador para que autorices la CLI.

#### Paso 3: Vincular a tu proyecto

```bash
supabase link --project-ref qyxusoqxwplzvftuumpb
```

Te pedirá la **database password** (la que pusiste al crear el proyecto en Supabase).

#### Paso 4: Configurar los secretos

Tu API key de Resend ya está guardada. Ahora configuramos las variables secretas:

```bash
# API key de Resend (la que me pasaste)
supabase secrets set RESEND_API_KEY=re_Zpw4sacF_9hNT4Xc4b7GK4Nwh7qbV7JMW

# Email del agente que recibe las cotizaciones
supabase secrets set SALES_EMAIL=ventas@c3nicaragua.com

# Email remitente (puedes usar el de prueba de Resend hasta verificar tu dominio)
supabase secrets set FROM_EMAIL="C3 Nicaragua <onboarding@resend.dev>"
```

> 📌 **Importante sobre FROM_EMAIL**:
> - Por defecto usa `onboarding@resend.dev` que es de Resend (solo envía a tu propio email).
> - Cuando verifiques tu dominio en Resend, cámbialo a algo como `cotizaciones@c3nicaragua.com`.

#### Paso 5: Desplegar la función

```bash
supabase functions deploy send-quotation-email --no-verify-jwt
```

El flag `--no-verify-jwt` permite que la función sea invocada desde el frontend directamente (ya validamos auth en el cliente).

**Resultado esperado:**
```
Deploying send-quotation-email (project ref: qyxusoqxwplzvftuumpb)
✓ Deployed Function send-quotation-email in 2s
Function URL: https://qyxusoqxwplzvftuumpb.supabase.co/functions/v1/send-quotation-email
```

#### Paso 6: Probar la función

```bash
curl -X POST 'https://qyxusoqxwplzvftuumpb.supabase.co/functions/v1/send-quotation-email' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGc...' \
  -d '{
    "id": "COT-TEST01",
    "customer_name": "Cliente de Prueba",
    "customer_phone": "+50588888888",
    "customer_email": "test@example.com",
    "total": 1450,
    "subtotal": 1450,
    "price_type": "public",
    "items": [
      {
        "product_name": "Stanley Quencher H2.0",
        "product_code": "ST-QUENCH-40",
        "brand_name": "Stanley",
        "color": "Negro Mate",
        "quantity": 1,
        "unit_price": 1450,
        "capacity": "40 oz"
      }
    ],
    "created_at": "2026-01-15T10:00:00Z"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "messageId": "abc123...",
  "sentTo": "ventas@c3nicaragua.com",
  "quotationId": "COT-TEST01"
}
```

Revisa la bandeja de `ventas@c3nicaragua.com` (y la carpeta de SPAM).

---

## 🔴 2. Realtime: cotizaciones en vivo

### Paso 1: Habilitar Realtime en la tabla

En SQL Editor de Supabase:

```sql
alter publication supabase_realtime add table public.quotations;
```

Si da error de "publication does not exist", usa:

```sql
create publication supabase_realtime for table public.quotations;
```

### Paso 2: Verificar que está habilitado

```sql
select * from pg_publication_tables where pubname = 'supabase_realtime';
```

Debe mostrar la tabla `quotations`.

### Paso 3: Ya está conectado en el frontend ✅

El componente `QuotationsPage` ya tiene la suscripción realtime activa. Cuando se inserte una nueva cotización, verás:
- 🟢 Indicador "EN VIVO" en el header
- 🔔 Toast verde emergente con los datos del cliente
- 🔊 Sonido (si lo activas con el botón "Sonido ON")
- 📋 La lista se actualiza automáticamente

### Probar el Realtime

1. Abre el panel admin: `/admin/cotizaciones` (en una pestaña)
2. En otra pestaña, ve a `/catalogo` y simula una cotización de prueba
3. Regresa a la pestaña del panel admin
4. Deberías ver el toast verde con la nueva cotización

---

## 🪝 3. Trigger automático con Database Webhooks (opcional)

Si quieres que el email se envíe **automáticamente cada vez que se inserte una cotización** (sin que el frontend tenga que llamarlo), configura un webhook en Supabase.

### Paso 1: Ir a Database Webhooks

En tu dashboard de Supabase:
- **Database** > **Webhooks** (en el menú lateral)
- Click en **"Create a new webhook"**

### Paso 2: Configurar el webhook

| Campo | Valor |
|---|---|
| **Name** | `send-quotation-email` |
| **Table** | `quotations` |
| **Events** | ✅ Insert |
| **Type** | Supabase Edge Function |
| **Function** | `send-quotation-email` |

### Paso 3: Crear

Click en **"Create webhook"**.

### Paso 4: Verificar

Ahora cada vez que un cliente envíe una cotización, el email se enviará automáticamente **sin que el frontend tenga que hacer nada extra**.

> 💡 **Tip**: Puedes tener **ambos métodos activos** (webhook + llamada desde frontend). El webhook es la red de seguridad por si el frontend falla.

---

## 🎨 4. Personalizar el email

El email tiene el branding completo de C3 Nicaragua:
- Header con gradiente de marca
- Badge de tipo de precio (Distribuidor / Público)
- Tabla con todos los productos
- Total destacado
- Botones directos a WhatsApp y email del cliente
- Footer con la marca

Si quieres modificarlo, edita la función `buildEmailHtml` en:
```
supabase/functions/send-quotation-email/index.ts
```

Luego redespliega:
```bash
supabase functions deploy send-quotation-email
```

---

## 🔐 5. Verificar tu dominio en Resend (recomendado)

Por defecto, los emails se envían desde `onboarding@resend.dev` (dirección de prueba de Resend). Esto **solo envía emails a la dirección con la que creaste la cuenta**.

### Para enviar a cualquier email:

1. Ve a [resend.com/domains](https://resend.com/domains)
2. Click en **"Add Domain"**
3. Ingresa tu dominio (ej: `c3nicaragua.com`)
4. Agrega los registros DNS que te muestra Resend:
   - SPF (TXT)
   - DKIM (CNAME)
   - DMARC (opcional pero recomendado)
5. Espera a que verifiquen (puede tardar hasta 48h)
6. Una vez verificado, actualiza el secreto:

```bash
supabase secrets set FROM_EMAIL="C3 Nicaragua <cotizaciones@c3nicaragua.com>"
```

Y redespliega:
```bash
supabase functions deploy send-quotation-email
```

---

## 📊 6. Monitoreo

### Logs de la Edge Function

En el dashboard de Supabase:
- **Edge Functions** > **send-quotation-email** > **Logs**

Verás cada invocación con:
- Status code
- Tiempo de respuesta
- Errores (si los hay)

### Métricas de Resend

En [resend.com/emails](https://resend.com/emails) verás:
- Emails enviados
- Tasa de apertura
- Rebotes
- SPAM

### Plan gratuito de Resend
- **100 emails/día**
- **3,000 emails/mes**
- **1 dominio verificado**
- 100% gratis

---

## 🐛 Solución de problemas

### ❌ "Function not found"
- Verifica que desplegaste: `supabase functions list`
- Redespliega: `supabase functions deploy send-quotation-email --no-verify-jwt`

### ❌ "Missing RESEND_API_KEY"
- Configura el secreto: `supabase secrets set RESEND_API_KEY=re_xxx`
- Redespliega la función después de cambiar secretos

### ❌ "You can only send testing emails to your own email"
- Estás usando `onboarding@resend.dev` sin verificar dominio
- O cambia el `SALES_EMAIL` al email con el que creaste la cuenta de Resend
- O verifica tu dominio (ver paso 5)

### ❌ Email no llega
- Revisa la carpeta de SPAM
- Verifica en [resend.com/emails](https://resend.com/emails) si aparece como "delivered"
- Revisa los logs de la función

### ❌ Realtime no actualiza
- Verifica que la tabla está en la publicación: `select * from pg_publication_tables where pubname = 'supabase_realtime';`
- Si no aparece, ejecuta: `alter publication supabase_realtime add table public.quotations;`
- Revisa la consola del navegador por errores de WebSocket

### ❌ "CORS error" al llamar la función
- El navegador bloquea la llamada. Verifica que la función incluye los headers CORS.
- Ya está manejado en el código de la función.

---

## ✅ Checklist de despliegue

- [ ] Supabase CLI instalado
- [ ] Login en Supabase CLI
- [ ] Proyecto vinculado con `supabase link`
- [ ] Secret `RESEND_API_KEY` configurado
- [ ] Secret `SALES_EMAIL` configurado
- [ ] Secret `FROM_EMAIL` configurado (opcional)
- [ ] Función `send-quotation-email` desplegada
- [ ] Realtime habilitado en tabla `quotations`
- [ ] (Opcional) Webhook configurado para auto-trigger
- [ ] Email de prueba recibido correctamente
- [ ] Realtime probado: nueva cotización aparece en vivo

---

## 🎯 Resultado final

Cuando un cliente envía una cotización, en **menos de 2 segundos**:
1. ✅ Se guarda en `quotations` y `quotation_items` en Supabase
2. ✅ Se abre WhatsApp con el mensaje prellenado (al cliente)
3. ✅ Se envía email HTML profesional al agente (vía Resend)
4. ✅ Aparece en tiempo real en el panel admin (vía Realtime)
5. ✅ Toast verde + sonido (opcional) notifica al agente

**¡Nunca perderás una venta!** 🎉
