# 🛍️ C3 Nicaragua - Catálogo Web de Vasos Térmicos

> **Tu idea, tu estilo.** Catálogo digital mayorista de vasos térmicos de las mejores marcas (Stanley, YETI, Owala, Lululemon, Thermos, Disney y genéricos) con sistema de cotización automática por **doble canal** (WhatsApp + Email).

![C3 Nicaragua](public/logo.svg)

---

## ✨ Características principales

### 🛒 Lado Público (Clientes / Distribuidores)
- 🏠 Home con catálogo destacado, marcas y beneficios
- 🔍 Catálogo con búsqueda, filtros por marca y categoría
- 📱 **Diseño mobile-first responsive** (mobile, tablet, desktop)
- 🌙 **Modo oscuro/claro** con switch automático
- 🛍️ Carrito de compras lateral (drawer)
- 💰 **Precio auto-calculado**: público por defecto, distribuidor se aplica automáticamente al alcanzar el mínimo (sin selector para el cliente)
- 📲 **Cotización automática por WhatsApp** (sin registro)
- ✉️ **Notificación por email al agente** (doble canal, vía EmailJS + Resend)
- 📄 Páginas institucionales: Marcas, Nosotros, Envíos, Contacto

### 🔐 Panel de Agente de Ventas (acceso oculto)
- **URL secreta**: `/admin/login` (no hay botón visible para el cliente)
- **Dashboard** con métricas, cotizaciones recientes, distribución por marca
- **CRUD completo de productos** con **subida de imagen** (file upload + URL)
- **Cotizaciones** con filtros por estado, vista de detalle, WhatsApp directo al cliente, email directo
- **Configuración** del sitio (WhatsApp, email, reglas de precio, info empresa)

### 🛠️ Stack Tecnológico
- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS 4** (siguiendo el manual de marca C3, con soporte dark mode)
- **React Router 7** para navegación SPA
- **Lucide React** para iconografía
- **LocalStorage** para persistencia (sin backend en demo)
- **EmailJS + Resend** para notificaciones por email
- **WhatsApp Click-to-Chat API** para cotizaciones

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# (Opcional) Configurar email - copia .env.example a .env y completa
cp .env.example .env

# Modo desarrollo
npm run dev

# Build de producción
npm run build
```

### 🔑 Credenciales del Panel Admin

- **URL secreta**: `/admin/login` (no enlazada en el sitio público)
- **Usuario**: `admin`
- **Contraseña**: `c3nicaragua2026`

---

## 📚 Documentación

Toda la documentación técnica del proyecto está en `docs/`:

1. **[Plan de Trabajo](docs/01-plan-de-trabajo.md)** — Alcance, stack, estructura del proyecto, fases.
2. **[Base de Datos - Modelo](docs/02-base-de-datos.md)** — Esquema SQL completo (PostgreSQL), seed data, API REST, seguridad.
3. **[Comunicación Cliente ↔ Agente](docs/03-comunicacion-cliente-agente.md)** — Flujo WhatsApp + Email (doble canal), ciclo de vida, formato del mensaje, configuración EmailJS/Resend.
4. **[🚀 Amazon RDS - Implementación Paso a Paso](docs/04-amazon-rds-implementacion.md)** — Guía detallada para desplegar la base de datos en Amazon RDS con todos los SQL de inyección de tablas.
5. **[⚡ Supabase - Implementación Paso a Paso](docs/05-supabase-implementacion.md)** — Guía detallada para usar Supabase (gratis) como backend: Auth, DB, Storage, Edge Functions, Realtime y deploy en Vercel.
6. **[🔌 Frontend Conectado a Supabase](docs/06-frontend-conexion-supabase.md)** — Cómo usar el frontend ya conectado a Supabase, credenciales, seguridad RLS y solución de problemas.
7. **[⚡ Edge Functions + Realtime + Email](docs/07-edge-functions-realtime.md)** — Despliegue de la Edge Function `send-quotation-email` con Resend, configuración de Realtime, webhooks automáticos y monitoreo.

---

## 💬 Flujo de Cotización (Doble Canal)

```
Cliente arma carrito → Checkout → Llena formulario (nombre, teléfono, email)
        ↓
Auto-cálculo:
  - < 5 unidades → precio público
  - ≥ 5 unidades → precio distribuidor (automático, no seleccionable)
        ↓
Al presionar "Enviar":
  1. Se guarda cotización en /admin/cotizaciones
  2. Se envía email automático al agente (ventas@c3nicaragua.com)
  3. Se abre WhatsApp con el mensaje prellenado al +505 8888 8888
        ↓
El mensaje incluye:
  - Datos del cliente
  - Código, marca, color, cantidad de cada producto
  - Total y tipo de precio aplicado
        ↓
Agente visualiza en /admin/cotizaciones y contacta al cliente
        ↓
Agente cambia estado: contactado → cerrada/cancelada
```

---

## 🌗 Modo Oscuro

- Switch manual en el header (ícono Luna/Sol)
- Detección automática de la preferencia del sistema operativo
- Persistencia en LocalStorage
- Contraste WCAG-AA garantizado en ambos modos

---

## 📦 Catálogo Incluido

21 productos de las 7 marcas:

- **Stanley**: Quencher H2.0 (40oz, 30oz), Flip Straw, IceFlow, Adventure
- **YETI**: Rambler (30oz, 20oz), Colster
- **Owala**: FreeSip (32oz, 24oz), Twist
- **Lululemon**: Back to Life (24oz, 32oz)
- **Thermos**: King, Funtainer, Stainless King
- **Disney**: Mickey Tumbler, Princesas, Star Wars
- **Genéricos**: Premium 30oz, Clásico 20oz, XL 40oz, Kids 12oz

Todos con **precio público** y **precio distribuidor** (-40% aprox.).

El admin puede:
- ✏️ Editar cualquier producto
- ➕ Crear nuevos productos con subida de imagen
- 🗑️ Eliminar productos
- ⭐ Marcar como destacado/nuevo

---

## 📞 Contacto C3 Nicaragua

- **WhatsApp**: +505 8888 8888
- **Email**: ventas@c3nicaragua.com
- **Ubicación**: Managua, Nicaragua

---

© 2026 C3 Nicaragua. Catálogo digital mayorista de vasos térmicos.
"# c3" 
