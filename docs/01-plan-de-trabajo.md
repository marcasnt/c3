# 📋 Plan de Trabajo - C3 Nicaragua

## Catálogo Web de Vasos Térmicos con Cotización por WhatsApp + Email

---

## 🎯 Objetivo General

Construir una plataforma web mayorista (catálogo digital) para la marca **C3 Nicaragua** que permita a los clientes (distribuidores y público) explorar el catálogo de vasos térmicos de las marcas **Stanley, YETI, Owala, Lululemon, Thermos, Disney y genéricos**, armar un carrito con los productos deseados y generar una **cotización automática enviada por DOBLE CANAL** (WhatsApp al cliente + Email al agente) sin requerir registro por parte del cliente.

El sistema incluye un **panel administrativo oculto** (accesible solo por URL secreta `/admin/login`) para que los agentes de ventas gestionen productos, visualicen cotizaciones, suban imágenes y cierren ventas.

---

## 🧩 Alcance Funcional

### 🛍️ Lado Público (Cliente / Distribuidor) — **Sin registro**
1. **Home** con hero, marcas, catálogo destacado, banners y novedades
2. **Catálogo** con búsqueda, filtros por marca/categoría, ordenamiento
3. **Detalle de producto** con galería, selector de color/cantidad, auto-cálculo de precio
4. **Marcas** (7 marcas)
5. **Nosotros, Envíos (con tabla de tarifas), Contacto**
6. **Carrito lateral** (drawer)
7. **Checkout** que genera mensaje y dispara WhatsApp + Email
8. **Botón flotante de WhatsApp** en todas las páginas
9. **🌙 Modo oscuro/claro** con switch y persistencia
10. **📱 Mobile-first responsive**

### 🔐 Lado Privado (Agente de Ventas) — **Acceso oculto por URL**
1. **Login** en `/admin/login` (sin enlace público, sin botón en el header)
   - Usuario: `admin` · Contraseña: `c3nicaragua2026`
2. **Dashboard** con métricas, cotizaciones recientes, distribución por marca
3. **CRUD de Productos** con:
   - Subida de imagen (file upload o URL)
   - Gestión de colores y características
   - Marcar destacado/nuevo/activo
4. **Cotizaciones** con:
   - Filtros por estado (Nueva, Contactado, Cerrada, Cancelada)
   - Vista de detalle
   - Acción directa a WhatsApp del cliente
   - Acción directa a email del cliente
5. **Configuración** del sitio (WhatsApp, email, reglas, info empresa)

---

## 💰 Regla de Negocio: Precio Público vs Distribuidor

El sistema aplica **automáticamente** el precio correcto, sin que el cliente tenga que seleccionarlo:

```
Si cantidad_total_del_carrito < 5 unidades  → Precio público
Si cantidad_total_del_carrito ≥ 5 unidades  → Precio distribuidor (automático)
```

- El umbral de 5 unidades es configurable desde `/admin/configuracion`.
- En la página de producto individual, el precio se actualiza en tiempo real según la cantidad elegida.
- En el checkout y carrito, se muestra una **barra de progreso** indicando cuántas unidades faltan para alcanzar el precio distribuidor.

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.x | Framework UI |
| **Vite** | 7.x | Build tool, dev server |
| **TypeScript** | 5.9.x | Tipado estático |
| **Tailwind CSS** | 4.x | Estilos utility-first con dark mode |
| **React Router** | 7.x | Navegación SPA |
| **Lucide React** | latest | Iconografía |

### Estado y Persistencia
- **React Context API** para el estado global
- **LocalStorage** para persistencia (carrito, cotizaciones, productos, sesión, config, tema)
- Esto permite que el sistema funcione 100% frontend con datos persistentes

### Comunicación (Doble Canal)
1. **WhatsApp Click-to-Chat API** (`wa.me/<número>?text=<mensaje>`) — Sin API key ni autenticación
2. **EmailJS + Resend** para notificaciones por email al agente
   - Capa gratuita: 200 emails/mes
   - Configurable vía variables de entorno

### Tipografía (según manual de marca)
- **Poppins** (principal): títulos y jerarquías
- **Inter** (secundaria): textos, botones, interfaces

---

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── Header.tsx       (sin acceso admin visible)
│   ├── Footer.tsx
│   ├── Logo.tsx
│   ├── ProductCard.tsx
│   ├── ProductImage.tsx (soporte imagen real o SVG fallback)
│   ├── CartDrawer.tsx
│   └── WhatsAppFab.tsx
├── pages/              # Páginas públicas
│   ├── HomePage.tsx
│   ├── CatalogPage.tsx
│   ├── ProductPage.tsx
│   ├── BrandsPage.tsx
│   ├── AboutPage.tsx
│   ├── ShippingPage.tsx
│   ├── ContactPage.tsx
│   └── CheckoutPage.tsx
├── pages/admin/        # Panel administrativo (oculto)
│   ├── AdminLoginPage.tsx
│   ├── AdminLayout.tsx
│   ├── DashboardPage.tsx
│   ├── ProductsPage.tsx (con subida de imagen)
│   ├── QuotationsPage.tsx
│   └── ConfigPage.tsx
├── hooks/
│   └── useTheme.ts     (dark mode con persistencia)
├── data/               # Datos seed
│   └── products.ts
├── store/              # Estado global
│   └── index.tsx
├── types/              # Tipos TypeScript
│   └── index.ts
├── utils/
│   └── cn.ts
├── App.tsx
├── main.tsx
└── index.css           (con variables de dark mode)
```

---

## ✅ Paleta de Colores (Manual de Marca C3)

| Token | Hex | Uso |
|---|---|---|
| `--brand-dark` | `#0A1B2A` | Estructura, confianza |
| `--brand-teal` | `#00BFA6` | Crecimiento, CTAs |
| `--brand-blue` | `#2563EB` | Tecnología, enlaces |
| `--brand-purple` | `#7C3AED` | Creatividad, acentos |
| Degradado | multicolor | Símbolo de variedad |

### Modo Oscuro
- Background: `#0f172a` (slate-900)
- Surface: `#1e293b` (slate-800)
- Text: `#f1f5f9` (slate-100)
- Accents: se mantienen iguales (teal, blue, purple)
- Contraste WCAG-AA garantizado

---

## 🚀 Fases de Implementación

1. **Fase 1 - Setup y Diseño Base** ✅
2. **Fase 2 - Catálogo Público** ✅
3. **Fase 3 - Carrito y Cotización** ✅
4. **Fase 4 - Panel Administrativo** ✅
5. **Fase 5 - Persistencia y Pulido** ✅
6. **Fase 6 - Mejoras de producción** ✅
   - Panel admin oculto (sin botón en header público)
   - Auto-cálculo de precios (sin selector)
   - Subida de imágenes en admin
   - Modo oscuro con buen contraste
   - Notificación por email (EmailJS + Resend)
   - Responsive mobile-first pulido
   - Mejor encuadre de imágenes en admin y cotizaciones

---

## 🔑 Credenciales de Acceso

- **URL secreta**: `/admin/login`
- **Usuario**: `admin`
- **Contraseña**: `c3nicaragua2026`

> ⚠️ En producción, las credenciales deben gestionarse en el backend (ver `02-base-de-datos.md`).
