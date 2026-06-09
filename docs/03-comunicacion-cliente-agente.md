# 📡 Tecnología de Comunicación Cliente ↔ Agente de Ventas

## C3 Nicaragua - Cotización por WhatsApp + Email (doble canal)

---

## 🎯 Resumen Ejecutivo

El sistema de comunicación entre el **cliente/distribuidor** y el **agente de ventas de C3 Nicaragua** opera en **doble canal en simultáneo** para garantizar que **ninguna venta se pierda**:

1. **📱 WhatsApp** (canal principal) — Click-to-Chat API oficial de Meta.
2. **✉️ Email** (canal de respaldo) — Vía **EmailJS** que entrega por **Resend** (o cualquier SMTP) al correo configurado del agente.

Ambas notificaciones se disparan **automáticamente** al momento en que el cliente presiona "Enviar cotización". La cotización también queda **persistida internamente** en el panel admin (`/admin/cotizaciones`) para su seguimiento.

---

## ✅ Razones de la elección

| Característica | Beneficio |
|---|---|
| **Sin costo de API de WhatsApp Business** | No requiere Meta Business verificado |
| **Sin servidor backend** | Funciona 100% frontend con EmailJS |
| **Doble canal = cero ventas perdidas** | WhatsApp (instantáneo) + Email (respaldo) |
| **Tiempo real** | El cliente ve abrir WhatsApp con su mensaje listo |
| **Persistencia interna** | El agente ve toda cotización en su panel |
| **Resend via EmailJS** | Email profesional que llega a la bandeja del agente |

---

## 🏗️ Arquitectura del Flujo

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│  Cliente    │  Click  │   Frontend   │  Click  │   WhatsApp     │
│  (catálogo) ├────────►│  C3 Nicaragua├────────►│  +50588888888  │
└─────────────┘         └──────┬───────┘         └────────┬───────┘
                               │                         │
                               │ 1. Persiste             │ Recibe
                               │    cotización           │ mensaje
                               │    en LocalStorage       │ formateado
                               │                         │
                               │ 2. EmailJS ───► Resend ─┐
                               │                        │
                               ▼                        ▼
                        ┌──────────────┐         ┌────────────────┐
                        │  /admin/     │         │  📧 Inbox del  │
                        │  cotizaciones│         │  Agente C3     │
                        │  (panel)     │         │  ventas@c3...  │
                        └──────┬───────┘         └────────┬───────┘
                               │                         │
                               └────────► Agente contacta ◄┘
                                          al cliente por
                                          WhatsApp → cierra venta ✅
```

---

## 🔧 Implementación Técnica

### 1. URL Base de WhatsApp Click-to-Chat

```
https://wa.me/<NÚMERO>?text=<MENSAJE_URL_ENCODED>
```

- **`<NÚMERO>`**: código de país + número, sin `+`, sin espacios, sin guiones.
  - Ejemplo Nicaragua: `50588888888`
- **`<MENSAJE_URL_ENCODED>`**: mensaje codificado con `encodeURIComponent()`

### 2. Función de Envío (implementada en `CheckoutPage.tsx`)

```typescript
import emailjs from '@emailjs/browser';

async function sendQuotation(form, items, totals) {
  // 1) Construir el mensaje formateado
  const message = buildWhatsAppMessage(form, items, totals);

  // 2) Persistir la cotización internamente
  const quotation = {
    id: `COT-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    customerName: form.name,
    customerPhone: form.phone,
    customerEmail: form.email,
    items,
    subtotal: totals.subtotal,
    total: totals.total,
    status: 'nueva',
  };
  saveQuotation(quotation); // en LocalStorage o POST a /api/quotations

  // 3) Enviar email de notificación al agente (CANAL DE RESPALDO)
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: siteConfig.salesEmail, // ej: ventas@c3nicaragua.com
        subject: `🛒 Nueva cotización C3 - ${quotation.id}`,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || 'N/A',
        quotation_id: quotation.id,
        total_items: totals.totalItems,
        total_amount: `C$ ${totals.total.toLocaleString('es-NI')}`,
        price_type: totals.priceType,
        message,
        note: form.note || 'Sin nota',
      },
      { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
    );
  } catch (err) {
    console.error('No se pudo enviar email, pero WhatsApp sí se enviará');
  }

  // 4) Abrir WhatsApp (CANAL PRINCIPAL)
  const phone = siteConfig.whatsappNumber.replace(/\D/g, '');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
```

### 3. Configuración de EmailJS (5 minutos)

#### Paso 1: Crear cuenta
1. Ve a [emailjs.com](https://www.emailjs.com/) y crea cuenta gratuita (200 emails/mes).

#### Paso 2: Conectar servicio de email
1. **Email Services > Add New Service**
2. Selecciona **Resend** (o Gmail, SendGrid, Outlook, custom SMTP).
3. Si usas Resend: crea cuenta en [resend.com](https://resend.com), obtén API key, agrégala en EmailJS.
4. Verifica el dominio o usa el remitente de prueba.
5. Copia el **Service ID**.

#### Paso 3: Crear template de email
1. **Email Templates > Create New Template**
2. Subject: `🛒 Nueva cotización C3 - {{quotation_id}}`
3. Content (HTML o texto):

```
Hola equipo de ventas C3,

Han recibido una nueva cotización a través del catálogo web.

📋 DETALLES DE LA COTIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: {{quotation_id}}
Fecha: ahora

👤 CLIENTE
Nombre: {{customer_name}}
Teléfono: {{customer_phone}}
Email: {{customer_email}}

💰 RESUMEN
Total de unidades: {{total_items}}
Monto total: {{total_amount}}
Tipo de precio aplicado: {{price_type}}

📝 NOTA DEL CLIENTE
{{note}}

💬 MENSAJE COMPLETO DE WHATSAPP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{message}}

---
Esta cotización fue generada automáticamente desde el catálogo web C3 Nicaragua.
Por favor contacta al cliente lo antes posible para cerrar la venta.
```

4. En **"To Email"** pon: `{{to_email}}`
5. Copia el **Template ID**.

#### Paso 4: Obtener Public Key
1. **Account > API Keys > Public Key** → cópiala.

#### Paso 5: Configurar variables de entorno
Crea un archivo `.env` en la raíz:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=tu_public_key_aqui
```

---

## 📨 Formato del Mensaje (Salida Real)

El siguiente es un ejemplo del mensaje que se genera automáticamente al presionar **"Enviar cotización"**:

```
*COTIZACIÓN C3 NICARAGUA*

*Cliente:* Marvin Pérez
*Teléfono:* +505 8450 8617
*Email:* marc@example.com
*Fecha:* 15/1/2026 14:32
*Tipo de precio aplicado:* ✅ DISTRIBUIDOR
*Total de unidades:* 7

*PRODUCTOS:*

1. *Stanley Quencher H2.0* 40 oz
   • Código: ST-QUENCH-40
   • Marca: Stanley
   • Color: Blanco Crema
   • Cantidad: 3
   • Precio unitario: C$ 870
   • Subtotal: C$ 2,610

2. *YETI Rambler* 30 oz
   • Código: YT-RAMBLER-30
   • Marca: YETI
   • Color: Negro
   • Cantidad: 2
   • Precio unitario: C$ 780
   • Subtotal: C$ 1,560

3. *Owala FreeSip* 32 oz
   • Código: OW-FREESIP-32
   • Marca: Owala
   • Color: Lila Sueño
   • Cantidad: 2
   • Precio unitario: C$ 780
   • Subtotal: C$ 1,560

*TOTAL: C$ 5,730*

✅ *Precio distribuidor aplicado automáticamente* (compra de 7 ≥ 5 unidades)

*Nota del cliente:* Por favor confirmar disponibilidad para entrega el viernes.

_Cotización generada desde catálogo web C3._
```

**Mismo mensaje llega por:**
- 📱 WhatsApp (al cliente y al abrirlo se envía al agente)
- ✉️ Email (a `ventas@c3nicaragua.com` automáticamente)
- 💾 Panel admin `/admin/cotizaciones` (internamente)

---

## 🔄 Ciclo de Vida de una Cotización

```
         ┌──────────┐
         │  NUEVA   │ ◄─── Cliente envía la cotización
         └────┬─────┘
              │ 1. Notificación por WhatsApp al cliente/agente
              │ 2. Notificación por email al agente
              │ 3. Aparece en /admin/cotizaciones
              ▼
      ┌──────────────┐
      │ CONTACTADO   │ ◄─── Agente habla con cliente por WhatsApp
      └────┬─────┬───┘
           │     │
           │     └──────────┐
           ▼                ▼
     ┌──────────┐      ┌──────────┐
     │ CERRADA  │      │CANCELADA │ ◄─── Si cliente desiste
     └──────────┘      └──────────┘
            │
            ▼
     Venta concretada ✅
```

### Estados definidos en el sistema

| Estado | Significado | Acción del Agente |
|---|---|---|
| **nueva** | Cotización recién creada (recién notificado) | Revisar y contactar |
| **contactado** | Cliente contactado | Negociar y dar seguimiento |
| **cerrada** | Venta concretada | Confirmar pago y envío |
| **cancelada** | Desistió o sin stock | Cerrar sin venta |

---

## 💬 Botón Flotante de WhatsApp (Asistencia General)

En todas las páginas públicas hay un **botón flotante** que abre un chat directo con el equipo de ventas para consultas generales:

```tsx
<a
  href="https://wa.me/50588888888?text=Hola%20C3%20Nicaragua..."
  target="_blank"
  rel="noreferrer"
  className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-[#25D366]"
>
  <MessageCircle />
</a>
```

---

## 🔐 Seguridad y Privacidad

1. **El número de WhatsApp** y el **email de ventas** se almacenan en la configuración del sitio y pueden ser actualizados desde `/admin/configuracion`.
2. **Datos del cliente**: nombre y teléfono son obligatorios; el email es opcional.
3. **Persistencia local (demo)**: los datos se guardan en LocalStorage del navegador.
4. **En producción con backend**: cumplir con la Ley de Protección de Datos Personales de Nicaragua (Ley 787).

---

## 🛣️ Roadmap de Mejoras Futuras

| Mejora | Descripción |
|---|---|
| **WhatsApp Business API oficial** | Integración con Meta para automatizar respuestas |
| **SMS de respaldo** | Si el cliente no tiene WhatsApp, enviar SMS |
| **Chat en vivo** | WebSocket para chat en tiempo real en el sitio |
| **Bot de auto-respuesta** | Responder FAQ automáticamente |
| **Dashboard de métricas** | Embudo de conversión cotización → venta |

---

## ✅ Resumen Final

| Aspecto | Tecnología |
|---|---|
| **Canal principal** | WhatsApp Click-to-Chat API |
| **Canal de respaldo** | Email vía EmailJS + Resend |
| **Persistencia** | LocalStorage (demo) / PostgreSQL (producción) |
| **Notificación al agente** | WhatsApp + Email simultáneos |
| **Seguimiento de ventas** | Panel admin con cambio de estados |
| **Costo** | $0 con planes gratuitos |

> 🎯 **Filosofía**: "ninguna venta se pierde". Doble canal = doble probabilidad de que el agente vea la cotización y contacte al cliente a tiempo.
