# 🚀 Implementación de Backend con Supabase (Gratis)

## C3 Nicaragua - Paso a Paso Detallado

---

## 📋 Tabla de Contenidos

1. [¿Por qué Supabase?](#-por-qué-supabase)
2. [Crear cuenta en Supabase](#-1-crear-cuenta-en-supabase)
3. [Crear el proyecto](#-2-crear-el-proyecto)
4. [Crear las tablas (SQL)](#-3-crear-las-tablas-sql)
5. [Insertar datos de prueba (Seed)](#-4-insertar-datos-de-prueba-seed)
6. [Configurar Row Level Security (RLS)](#-5-configurar-row-level-security-rls)
7. [Configurar Storage para imágenes](#-6-configurar-storage-para-imágenes)
8. [Configurar Authentication para el admin](#-7-configurar-authentication-para-el-admin)
9. [Edge Functions: Email + WhatsApp](#-8-edge-functions-email--whatsapp)
10. [Real-time: cotizaciones en vivo](#-9-real-time-cotizaciones-en-vivo)
11. [Conectar el frontend a Supabase](#-10-conectar-el-frontend-a-supabase)
12. [Desplegar el frontend en Vercel](#-11-Desplegar-el-frontend-en-vercel)
13. [Plan gratuito: límites y tips](#-plan-gratuito-límites-y-tips)
14. [Checklist final](#-checklist-final)

---

## ✅ ¿Por qué Supabase?

| Ventaja | Detalle |
|---|---|
| **100% gratis para empezar** | 500 MB de base de datos, 1 GB de storage, 50,000 usuarios activos |
| **Sin tarjeta de crédito** | El plan Free no requiere tarjeta |
| **PostgreSQL real** | Toda la potencia de PostgreSQL con panel visual |
| **Auth incluido** | Sistema de login listo para usar |
| **Storage incluido** | Para subir las imágenes de los productos |
| **API REST automática** | Se genera al crear las tablas |
| **Real-time** | WebSockets listos para cotizaciones en vivo |
| **Edge Functions** | Para enviar emails y procesar lógica |
| **Dashboard amigable** | Editor SQL visual, similar a Notion |

---

## 🔐 1. Crear cuenta en Supabase

### Paso 1.1: Ir a Supabase
Abre tu navegador: [https://supabase.com/](https://supabase.com/)

### Paso 1.2: Click en "Start your project"
Botón verde en la esquina superior derecha.

### Paso 1.3: Registrarse
Puedes registrarte con:
- ✅ **GitHub** (recomendado)
- ✅ **GitLab**
- ✅ **Google**
- ✅ Email + contraseña

**Recomendado**: usa GitHub, es más rápido y te servirá después para deployar en Vercel.

### Paso 1.4: Confirmar correo
Si te registraste con email, revisa tu bandeja y confirma.

---

## 🏗️ 2. Crear el proyecto

### Paso 2.1: Crear nuevo proyecto
1. Una vez logueado, click en **"New Project"**.
2. Selecciona tu **organización** (o crea una nueva).

### Paso 2.2: Configurar el proyecto
Completa el formulario:

| Campo | Valor recomendado |
|---|---|
| **Name** | `c3-nicaragua` |
| **Database Password** | Genera una contraseña fuerte y **guárdala** |
| **Region** | `South America (São Paulo)` o la más cercana a Nicaragua |
| **Pricing Plan** | `Free` (gratis) |

### Paso 2.3: Esperar
Supabase tardará **1-2 minutos** en provisionar la base de datos.

### Paso 2.4: Guardar credenciales
Una vez listo, ve a **Settings > API** y copia:

```
Project URL:    https://xxxxxxxxxxxxx.supabase.co
anon public:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (¡SECRETO!)
```

> ⚠️ **IMPORTANTE**: La `service_role` key tiene acceso total. NUNCA la pongas en el frontend.

---

## 🗄️ 3. Crear las tablas (SQL)

### Paso 3.1: Abrir el SQL Editor
1. En el panel izquierdo, click en **"SQL Editor"** (icono de base de datos).
2. Click en **"New query"**.

### Paso 3.2: TABLA — `brands` (Marcas)

```sql
-- =====================================================
-- TABLA: brands (Marcas de productos)
-- =====================================================
create table public.brands (
  id          bigserial primary key,
  name        varchar(50)  unique not null,
  slug        varchar(50)  unique not null,
  color_hex   varchar(7)   not null,
  logo_text   varchar(50)  not null,
  is_active   boolean      default true,
  created_at  timestamptz  default now()
);

create index idx_brands_slug on public.brands(slug);
create index idx_brands_active on public.brands(is_active) where is_active = true;

comment on table public.brands is 'Marcas de productos (Stanley, YETI, Owala, etc.)';
```

Click en **"Run"** (o Ctrl+Enter). Debe decir "Success".

---

### Paso 3.3: TABLA — `categories` (Categorías)

```sql
-- =====================================================
-- TABLA: categories (Categorías de productos)
-- =====================================================
create table public.categories (
  id          bigserial primary key,
  name        varchar(80)  unique not null,
  slug        varchar(80)  unique not null,
  description text,
  is_active   boolean      default true,
  sort_order  int          default 0
);

create index idx_categories_slug on public.categories(slug);
create index idx_categories_active on public.categories(is_active) where is_active = true;
```

---

### Paso 3.4: TABLA — `products` (Productos)

```sql
-- =====================================================
-- TABLA: products (Catálogo de productos)
-- =====================================================
create table public.products (
  id                  uuid          primary key default gen_random_uuid(),
  code                varchar(50)   unique not null,
  name                varchar(200)  not null,
  brand_id            bigint        not null references public.brands(id) on delete restrict,
  category_id         bigint        not null references public.categories(id) on delete restrict,
  capacity            varchar(20),
  price_public        numeric(10,2) not null check (price_public >= 0),
  price_distributor   numeric(10,2) not null check (price_distributor >= 0),
  description         text,
  features            jsonb         default '[]'::jsonb,
  colors              jsonb         default '[]'::jsonb,
  stock               int           default 0 check (stock >= 0),
  is_featured         boolean       default false,
  is_new              boolean       default false,
  is_active           boolean       default true,
  packaging           varchar(200),
  image_url           text,
  created_at          timestamptz   default now(),
  updated_at          timestamptz   default now()
);

create index idx_products_brand on public.products(brand_id);
create index idx_products_category on public.products(category_id);
create index idx_products_code on public.products(code);
create index idx_products_featured on public.products(is_featured) where is_featured = true;
create index idx_products_new on public.products(is_new) where is_new = true;
create index idx_products_active on public.products(is_active) where is_active = true;
create index idx_products_search on public.products using gin (
  to_tsvector('spanish', name || ' ' || code || ' ' || capacity)
);

-- Trigger para updated_at automático
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_products_updated_at
before update on public.products
for each row execute function public.update_updated_at_column();
```

---

### Paso 3.5: TABLA — `quotations` (Cotizaciones)

```sql
-- =====================================================
-- TABLA: quotations (Cotizaciones generadas)
-- =====================================================
create type public.quotation_status as enum ('nueva', 'contactado', 'cerrada', 'cancelada');

create table public.quotations (
  id              varchar(50)   primary key,
  customer_name   varchar(200)  not null,
  customer_phone  varchar(30)   not null,
  customer_email  varchar(200),
  customer_note   text,
  subtotal        numeric(12,2) not null,
  total           numeric(12,2) not null,
  price_type      varchar(20)   default 'public' check (price_type in ('public', 'distributor')),
  status          public.quotation_status default 'nueva',
  source          varchar(50)   default 'web',
  created_at      timestamptz   default now(),
  updated_at      timestamptz   default now(),
  contacted_at    timestamptz,
  closed_at       timestamptz
);

create index idx_quotations_status on public.quotations(status);
create index idx_quotations_created on public.quotations(created_at desc);
create index idx_quotations_phone on public.quotations(customer_phone);
create index idx_quotations_email on public.quotations(customer_email) where customer_email is not null;
create index idx_quotations_price_type on public.quotations(price_type);

create trigger update_quotations_updated_at
before update on public.quotations
for each row execute function public.update_updated_at_column();
```

---

### Paso 3.6: TABLA — `quotation_items` (Items de cotización)

```sql
-- =====================================================
-- TABLA: quotation_items (Items dentro de cada cotización)
-- =====================================================
create table public.quotation_items (
  id              uuid          primary key default gen_random_uuid(),
  quotation_id    varchar(50)   not null references public.quotations(id) on delete cascade,
  product_id      uuid          not null references public.products(id) on delete restrict,
  product_code    varchar(50)   not null,
  product_name    varchar(200)  not null,
  brand_name      varchar(50)   not null,
  color           varchar(100)  not null,
  quantity        int           not null check (quantity > 0),
  unit_price      numeric(10,2) not null,
  line_total      numeric(12,2) not null,
  created_at      timestamptz   default now()
);

create index idx_quotation_items_quotation on public.quotation_items(quotation_id);
create index idx_quotation_items_product on public.quotation_items(product_id);
```

---

### Paso 3.7: TABLA — `site_config` (Configuración)

```sql
-- =====================================================
-- TABLA: site_config (Configuración del sitio)
-- =====================================================
create table public.site_config (
  key         varchar(100) primary key,
  value       jsonb        not null,
  description text,
  updated_at  timestamptz  default now()
);

comment on table public.site_config is 'Configuración dinámica del sitio (WhatsApp, email, reglas)';
```

---

### Paso 3.8: TABLA — `profiles` (Perfiles de admin)

```sql
-- =====================================================
-- TABLA: profiles (Perfiles de usuarios admin)
-- Supabase maneja auth.users automáticamente,
-- profiles extiende con datos extra
-- =====================================================
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  username    varchar(50) unique not null,
  full_name   varchar(200) not null,
  role        varchar(20) not null default 'agente' check (role in ('admin', 'agente', 'supervisor')),
  is_active   boolean     default true,
  created_at  timestamptz default now()
);

create index idx_profiles_username on public.profiles(username);

-- Trigger para crear perfil automáticamente cuando se crea un usuario en auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', 'Agente C3'),
    coalesce(new.raw_user_meta_data->>'role', 'agente')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

### Paso 3.9: Verificar todas las tablas creadas

Ejecuta esta query:

```sql
select
  schemaname,
  tablename
from pg_tables
where schemaname = 'public'
order by tablename;
```

**Deberías ver 7 tablas:**

```
audit_log                (opcional, no la creamos, ver abajo)
brands
categories
products
profiles
quotation_items
quotations
site_config
```

> 📌 Si quieres auditoría, puedes agregar `audit_log` después. Para empezar, estas 7 son suficientes.

---

## 🌱 4. Insertar datos de prueba (Seed)

### Paso 4.1: Insertar marcas

```sql
-- SEED: Marcas
insert into public.brands (name, slug, color_hex, logo_text) values
  ('Stanley',   'stanley',   '#1B1B1B', 'STANLEY'),
  ('YETI',      'yeti',      '#0F4C81', 'YETI'),
  ('Owala',     'owala',     '#9333EA', 'owala'),
  ('Lululemon', 'lululemon', '#C9082A', 'lululemon'),
  ('Thermos',   'thermos',   '#DC2626', 'THERMOS'),
  ('Disney',    'disney',    '#1E40AF', 'Disney'),
  ('Genéricos', 'genericos', '#0A1B2A', 'GENÉRICOS')
on conflict (name) do nothing;
```

---

### Paso 4.2: Insertar categorías

```sql
-- SEED: Categorías
insert into public.categories (name, slug, description, sort_order) values
  ('Todos los vasos',   'todos',          'Todos los productos',            0),
  ('Con tapa y popote', 'tapa-popote',    'Vasos con popote integrado',     1),
  ('Con asa',           'con-asa',        'Vasos con asa de transporte',    2),
  ('Botellas',          'botellas',       'Botellas térmicas clásicas',     3),
  ('Kids / Disney',     'kids-disney',    'Productos para niños y Disney',  4),
  ('Genéricos',         'genericos',      'Línea genérica para sublimar',   5),
  ('Accesorios',        'accesorios',     'Popotes, tapas y más',           6)
on conflict (name) do nothing;
```

---

### Paso 4.3: Insertar productos (catálogo completo)

```sql
-- SEED: 21 productos del catálogo

-- ============ STANLEY ============
insert into public.products (code, name, brand_id, category_id, capacity, price_public, price_distributor, colors, features, stock, is_featured, is_new, packaging, description) values
('ST-QUENCH-40', 'Stanley Quencher H2.0', 1, 3, '40 oz', 1450, 870,
  '[{"name":"Blanco Crema","hex":"#F5F1E8"},{"name":"Rosa Palo","hex":"#E8B4B8"},{"name":"Negro Mate","hex":"#1A1A1A"},{"name":"Verde Salvia","hex":"#9CAF88"},{"name":"Azul Cielo","hex":"#87CEEB"}]'::jsonb,
  '["Aislamiento al vacío de doble pared","Tapa FlowState™ 3 posiciones","Compatible con portavasos","Acero inoxidable 18/8 reciclado","Libre de BPA"]'::jsonb,
  35, true, true, 'Caja individual con sticker oficial',
  'El vaso térmico icónico de Stanley con aislamiento al vacío de doble pared. Mantiene tus bebidas frías por 11 horas y calientes por 7 horas.'),

('ST-QUENCH-30', 'Stanley Quencher H2.0', 1, 3, '30 oz', 1290, 780,
  '[{"name":"Blanco Crema","hex":"#F5F1E8"},{"name":"Negro Mate","hex":"#1A1A1A"},{"name":"Lila","hex":"#C8A2C8"},{"name":"Verde Menta","hex":"#98D8C8"}]'::jsonb,
  '["Aislamiento de doble pared","Tapa FlowState™","Base ergonómica","Acero reciclado 18/8"]'::jsonb,
  28, true, false, 'Caja individual',
  'Versión compacta del Quencher, perfecta para el día a día.'),

('ST-FLIP-20', 'Stanley Flip Straw', 1, 2, '20 oz', 950, 580,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Verde","hex":"#2D5F3F"},{"name":"Rosa","hex":"#FFB6C1"}]'::jsonb,
  '["Popote abatible integrado","Aislamiento doble pared","A prueba de fugas","Asa de transporte"]'::jsonb,
  40, false, false, 'Caja individual',
  'Vaso con popote abatible, ideal para hidratarse fácilmente.'),

('ST-ICEFLOW-30', 'Stanley IceFlow Flip', 1, 2, '30 oz', 1180, 710,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Azul Marino","hex":"#1E3A5F"}]'::jsonb,
  '["Popote flip integrado","Aislamiento al vacío","Asa ergonómica","Apto para lavavajillas"]'::jsonb,
  32, false, true, 'Caja individual',
  'Vaso con popote flip y aislamiento al vacío.'),

('ST-ADV-24', 'Stanley Adventure', 1, 4, '24 oz', 880, 530,
  '[{"name":"Verde Hunter","hex":"#2D4A2B"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Naranja","hex":"#FF6B35"}]'::jsonb,
  '["Acero 18/8","Tapa hermética","Aislamiento doble pared","Garantía de por vida"]'::jsonb,
  25, false, false, 'Caja individual',
  'Botella térmica clásica de Stanley, resistente y duradera.'),

-- ============ YETI ============
('YT-RAMBLER-30', 'YETI Rambler', 2, 3, '30 oz', 1300, 780,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Blanco","hex":"#FFFFFF"},{"name":"Gris Carbón","hex":"#3A3A3A"},{"name":"Azul Marino","hex":"#0F2C4D"},{"name":"Verde Bosque","hex":"#2D4A2B"}]'::jsonb,
  '["Aislamiento al vacío de doble pared","Acero inoxidable 18/8","Acabado DuraCoat™","No sudada al tacto","Base antideslizante"]'::jsonb,
  30, true, false, 'Caja YETI oficial',
  'El vaso YETI Rambler con asa, combinación perfecta de resistencia y aislamiento.'),

('YT-RAMBLER-20', 'YETI Rambler', 2, 4, '20 oz', 1050, 630,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Blanco","hex":"#FFFFFF"},{"name":"Gris","hex":"#6B6B6B"},{"name":"Verde","hex":"#2D4A2B"}]'::jsonb,
  '["Aislamiento al vacío","Acero 18/8","Tapa MagSlider™","Resistente a caídas"]'::jsonb,
  22, false, false, 'Caja YETI oficial',
  'Tamaño compacto con la misma potencia térmica YETI.'),

('YT-COLSTER', 'YETI Rambler Colster', 2, 4, '12 oz', 580, 350,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Blanco","hex":"#FFFFFF"},{"name":"Azul","hex":"#1E40AF"}]'::jsonb,
  '["Aislamiento al vacío","Capacidad 12 oz","Anticondensación","Base estable"]'::jsonb,
  50, false, false, 'Caja YETI oficial',
  'Mantén tus latas y botellas siempre frías.'),

-- ============ OWALA ============
('OW-FREESIP-32', 'Owala FreeSip', 3, 2, '32 oz', 1250, 780,
  '[{"name":"Lila Sueño","hex":"#C8A2C8"},{"name":"Verde Menta","hex":"#98D8C8"},{"name":"Blanco Nube","hex":"#FFFFFF"},{"name":"Rosa Bebé","hex":"#FFB6C1"},{"name":"Azul Cielo","hex":"#87CEEB"}]'::jsonb,
  '["Boquilla FreeSip patentada","Popote oculto integrado","Aislamiento triple pared","Asa de transporte","Libre de BPA"]'::jsonb,
  38, true, true, 'Caja Owala oficial',
  'Innovadora botella con boquilla FreeSip patentada: bebe con popote o directamente.'),

('OW-FREESIP-24', 'Owala FreeSip', 3, 2, '24 oz', 990, 610,
  '[{"name":"Lila","hex":"#C8A2C8"},{"name":"Verde","hex":"#98D8C8"},{"name":"Blanco","hex":"#FFFFFF"},{"name":"Rosa","hex":"#FFB6C1"}]'::jsonb,
  '["Boquilla FreeSip","Triple aislamiento","Popote oculto","A prueba de fugas"]'::jsonb,
  45, false, false, 'Caja Owala oficial',
  'Versión mediana de la FreeSip.'),

('OW-TWIST-20', 'Owala Twist', 3, 4, '20 oz', 850, 510,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Verde","hex":"#98D8C8"}]'::jsonb,
  '["Tapa twist de un giro","Aislamiento doble","Boquilla ergonómica","Asa integrada"]'::jsonb,
  30, false, false, 'Caja Owala oficial',
  'Botella con tapa twist de un giro.'),

-- ============ LULULEMON ============
('LL-BACKLIFE-24', 'Lululemon Back to Life', 4, 3, '24 oz', 1350, 810,
  '[{"name":"Blanco Hueso","hex":"#F5F1E8"},{"name":"Gris Piedra","hex":"#8B8680"},{"name":"Negro Suave","hex":"#2A2A2A"},{"name":"Verde Salvia","hex":"#9CAF88"}]'::jsonb,
  '["Acabado mate premium","Aislamiento al vacío","Tapa antipérdida","Asa ergonómica","Libre de BPA"]'::jsonb,
  20, true, false, 'Caja Lululemon premium',
  'Vaso térmico premium de Lululemon, diseñado para el estilo de vida activo.'),

('LL-BACKLIFE-32', 'Lululemon Back to Life', 4, 3, '32 oz', 1550, 930,
  '[{"name":"Blanco Hueso","hex":"#F5F1E8"},{"name":"Gris Piedra","hex":"#8B8680"},{"name":"Negro","hex":"#1A1A1A"}]'::jsonb,
  '["Capacidad 32 oz","Acabado mate","Aislamiento al vacío","Tapa antiderrame"]'::jsonb,
  18, false, true, 'Caja Lululemon premium',
  'Capacidad extendida con el mismo diseño premium.'),

-- ============ THERMOS ============
('TH-KING-16', 'Thermos King', 5, 4, '16 oz', 720, 430,
  '[{"name":"Negro Mate","hex":"#1A1A1A"},{"name":"Acero Pulido","hex":"#C0C0C0"},{"name":"Azul Medianoche","hex":"#191970"}]'::jsonb,
  '["Aislamiento al vacío","24h frío / 12h caliente","Tapa con vaso","Acero 18/8"]'::jsonb,
  40, true, false, 'Caja Thermos oficial',
  'Botella Thermos King, la clásica que no pasa de moda.'),

('TH-FUNTAINER-12', 'Thermos Funtainer', 5, 5, '12 oz', 580, 350,
  '[{"name":"Rosa","hex":"#FFB6C1"},{"name":"Azul","hex":"#87CEEB"},{"name":"Verde","hex":"#98D8C8"}]'::jsonb,
  '["Para niños","Popote integrado","Aislamiento al vacío","12h frío"]'::jsonb,
  35, false, false, 'Caja Thermos',
  'Botella térmica para niños con diseños divertidos.'),

('TH-INTL-24', 'Thermos Stainless King', 5, 3, '24 oz', 950, 570,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Acero","hex":"#C0C0C0"}]'::jsonb,
  '["24 oz","Asa ergonómica","Tapa antiderrame","Aislamiento doble"]'::jsonb,
  28, false, false, 'Caja Thermos',
  'Vaso térmico de gran capacidad con asa.'),

-- ============ DISNEY ============
('DS-MICKEY-24', 'Disney Mickey Tumbler', 6, 5, '24 oz', 650, 390,
  '[{"name":"Rojo Mickey","hex":"#E63946"},{"name":"Negro Mickey","hex":"#1A1A1A"},{"name":"Rosa Minnie","hex":"#FFB6C1"}]'::jsonb,
  '["Diseño oficial Disney","Aislamiento al vacío","Popote incluido","24 oz capacidad"]'::jsonb,
  50, true, true, 'Caja Disney oficial',
  'Vaso oficial de Disney con diseños de Mickey y Minnie.'),

('DS-PRINCESA-16', 'Disney Princesas', 6, 5, '16 oz', 520, 310,
  '[{"name":"Rosa","hex":"#FFB6C1"},{"name":"Lila","hex":"#C8A2C8"},{"name":"Celeste","hex":"#87CEEB"}]'::jsonb,
  '["Diseños princesas","Asa lateral","Popote incluido","Apto niños"]'::jsonb,
  42, false, false, 'Caja Disney oficial',
  'Vaso con diseños de princesas Disney.'),

('DS-STARWARS-20', 'Disney Star Wars', 6, 5, '20 oz', 620, 380,
  '[{"name":"Negro Imperial","hex":"#1A1A1A"},{"name":"Gris Jedi","hex":"#6B6B6B"}]'::jsonb,
  '["Diseño Star Wars","20 oz","Tapa con popote","Aislamiento térmico"]'::jsonb,
  38, false, true, 'Caja Disney oficial',
  'Vaso Star Wars para los fans de la saga.'),

-- ============ GENÉRICOS ============
('GN-STD-30', 'Vaso Genérico Premium', 7, 6, '30 oz', 520, 310,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Azul","hex":"#2563EB"},{"name":"Rosa","hex":"#FFB6C1"},{"name":"Verde","hex":"#10B981"},{"name":"Amarillo","hex":"#FBBF24"}]'::jsonb,
  '["Ideal para sublimar","Acero 18/8","Aislamiento doble","Asa ergonómica","Múltiples colores"]'::jsonb,
  80, true, false, 'Embalaje individual',
  'Vaso térmico genérico de alta calidad, ideal para personalización.'),

('GN-STD-20', 'Vaso Genérico Clásico', 7, 6, '20 oz', 380, 230,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Azul","hex":"#2563EB"},{"name":"Rosa","hex":"#FFB6C1"},{"name":"Verde","hex":"#10B981"}]'::jsonb,
  '["Para sublimar","Acero inoxidable","Tapa transparente","20 oz"]'::jsonb,
  100, false, false, 'Embalaje individual',
  'Vaso genérico de 20 oz, perfecto para regalos corporativos.'),

('GN-STD-40', 'Vaso Genérico XL', 7, 6, '40 oz', 620, 380,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Azul","hex":"#2563EB"},{"name":"Verde","hex":"#10B981"}]'::jsonb,
  '["40 oz","Asa robusta","Tapa con popote","Para personalizar"]'::jsonb,
  60, false, false, 'Embalaje individual',
  'Vaso de gran capacidad 40 oz, ideal para deportistas.'),

('GN-KIDS-12', 'Vaso Kids Genérico', 7, 5, '12 oz', 320, 190,
  '[{"name":"Rosa","hex":"#FFB6C1"},{"name":"Azul","hex":"#87CEEB"},{"name":"Verde","hex":"#98D8C8"},{"name":"Amarillo","hex":"#FBBF24"}]'::jsonb,
  '["Tamaño infantil","Popote incluido","Asa lateral","A prueba de fugas"]'::jsonb,
  70, false, false, 'Embalaje individual',
  'Vaso térmico para niños con diseños personalizables.')

on conflict (code) do nothing;
```

---

### Paso 4.4: Insertar configuración inicial

```sql
-- SEED: Configuración del sitio
insert into public.site_config (key, value, description) values
  ('whatsapp_number',    '"+50588888888"'::jsonb,           'Número de WhatsApp de ventas'),
  ('sales_email',        '"ventas@c3nicaragua.com"'::jsonb,  'Email del agente que recibe notificaciones'),
  ('company_name',       '"C3 Nicaragua"'::jsonb,            'Nombre de la empresa'),
  ('address',            '"Managua, Nicaragua"'::jsonb,      'Dirección'),
  ('min_distributor_qty','5'::jsonb,                         'Cantidad mínima para precio distribuidor'),
  ('shipping_zones',     '[
    {"department":"Managua","time":"24-48 horas","cost":80},
    {"department":"León, Granada, Masaya","time":"48 horas","cost":120},
    {"department":"Estelí, Matagalpa, Jinotega","time":"48-72 horas","cost":150},
    {"department":"Caribe","time":"72 horas","cost":200}
  ]'::jsonb,                                                  'Zonas de envío')
on conflict (key) do nothing;
```

---

### Paso 4.5: Verificar los datos insertados

```sql
-- Ver conteo
select 'brands' as tabla, count(*) from public.brands
union all select 'categories', count(*) from public.categories
union all select 'products', count(*) from public.products
union all select 'site_config', count(*) from public.site_config;

-- Ver los primeros 5 productos con su marca
select
  p.code,
  p.name,
  b.name as brand,
  p.price_public,
  p.price_distributor,
  p.stock
from public.products p
join public.brands b on p.brand_id = b.id
limit 5;
```

**Resultado esperado:**

| tabla | count |
|---|---|
| brands | 7 |
| categories | 7 |
| products | 21 |
| site_config | 6 |

---

## 🔐 5. Configurar Row Level Security (RLS)

> 🔒 RLS es lo que hace que tu base de datos sea **segura**. Sin esto, cualquiera con la URL podría leer/escribir todo.

### Paso 5.1: Habilitar RLS en todas las tablas

```sql
alter table public.brands         enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.quotations     enable row level security;
alter table public.quotation_items enable row level security;
alter table public.site_config    enable row level security;
alter table public.profiles       enable row level security;
```

---

### Paso 5.2: Políticas para LECTURA PÚBLICA (catálogo)

Los clientes pueden **ver** productos, marcas y categorías sin estar logueados:

```sql
-- Cualquiera puede LEER las marcas
create policy "Marcas visibles públicamente"
  on public.brands for select
  using (is_active = true);

-- Cualquiera puede LEER las categorías
create policy "Categorías visibles públicamente"
  on public.categories for select
  using (is_active = true);

-- Cualquiera puede LEER los productos activos
create policy "Productos visibles públicamente"
  on public.products for select
  using (is_active = true);

-- Cualquiera puede LEER la config pública (solo keys específicas, ver abajo)
-- ⚠️ Para config, creamos una vista con los datos públicos
```

---

### Paso 5.3: Política para CREAR cotizaciones (público)

Cualquiera puede crear cotizaciones (es lo que hace el cliente en el checkout):

```sql
-- Cualquiera puede INSERTAR cotizaciones
create policy "Cualquiera puede crear cotizaciones"
  on public.quotations for insert
  with check (true);

-- Cualquiera puede INSERTAR items de cotización
create policy "Cualquiera puede crear items de cotización"
  on public.quotation_items for insert
  with check (true);

-- Los clientes NO pueden LEER cotizaciones (solo el admin)
-- Por eso NO creamos política de SELECT en quotations
```

---

### Paso 5.4: Políticas para el ADMIN (autenticado)

Solo usuarios autenticados con rol `admin` o `agente` pueden gestionar todo:

```sql
-- Admin puede LEER todas las cotizaciones
create policy "Admin lee cotizaciones"
  on public.quotations for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  );

-- Admin puede ACTUALIZAR cotizaciones (cambiar estado)
create policy "Admin actualiza cotizaciones"
  on public.quotations for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  );

-- Admin puede ELIMINAR cotizaciones
create policy "Admin elimina cotizaciones"
  on public.quotations for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  );

-- Admin puede LEER items de cotización
create policy "Admin lee items"
  on public.quotation_items for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  );

-- Admin puede CRUD de productos
create policy "Admin gestiona productos"
  on public.products for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  );

-- Admin puede gestionar marcas y categorías
create policy "Admin gestiona marcas"
  on public.brands for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  );

create policy "Admin gestiona categorías"
  on public.categories for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  );

-- Admin puede LEER/EDITAR site_config
create policy "Admin gestiona config"
  on public.site_config for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
    )
  );

-- Admin puede ver su propio perfil
create policy "Usuarios ven su perfil"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());
```

---

### Paso 5.5: Vista pública para configuración

Para que el frontend pueda leer la config (WhatsApp, email, etc.) sin autenticarse:

```sql
-- Vista con los datos públicos de config
create or replace view public.public_config as
select
  key,
  value
from public.site_config
where key in ('whatsapp_number', 'sales_email', 'company_name', 'address', 'min_distributor_qty', 'shipping_zones');

-- Permitir lectura pública de la vista
grant select on public.public_config to anon, authenticated;

-- (La vista bypassea RLS, así que solo exponemos los keys que listamos arriba)
```

---

## 🖼️ 6. Configurar Storage para imágenes

### Paso 6.1: Crear bucket para productos

1. En el panel izquierdo, click en **"Storage"**.
2. Click en **"New bucket"**.
3. Configurar:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Activar (para que las imágenes sean accesibles públicamente)
4. Click en **"Create bucket"**.

### Paso 6.2: Crear políticas del bucket

Ve a **Storage > product-images > Policies** y agrega:

**Política 1: Lectura pública (cualquiera ve las imágenes)**
```sql
create policy "Imágenes públicas"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );
```

**Política 2: Solo admin puede subir**
```sql
create policy "Admin sube imágenes"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
  )
);
```

**Política 3: Solo admin puede eliminar**
```sql
create policy "Admin elimina imágenes"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'agente', 'supervisor')
  )
);
```

### Paso 6.3: Estructura recomendada del bucket
```
product-images/
├── ST-QUENCH-40.jpg
├── ST-QUENCH-30.jpg
├── OW-FREESIP-32.jpg
├── ...
```

> 💡 **Tip**: usa el `code` del producto como nombre de archivo. Así cada producto tiene su imagen fácil de referenciar.

---

## 👤 7. Configurar Authentication para el admin

### Paso 7.1: Crear el usuario admin manualmente

**Opción A: Desde el dashboard de Supabase**
1. Ve a **Authentication > Users**.
2. Click en **"Add user > Create new user"**.
3. Completar:
   - **Email**: `admin@c3nicaragua.com`
   - **Password**: `C3Nicaragua2026!` (o la que prefieras)
   - **Auto Confirm User**: ✅ Activar (para que no requiera confirmación de email)
4. Click en **"Create user"**.

**Opción B: Por SQL (insertar en auth.users)**

Esto es más complejo, mejor usa la opción A.

### Paso 7.2: Actualizar el perfil del admin

Ahora actualiza el perfil (el trigger `handle_new_user` ya creó uno, pero le pondremos el rol correcto):

```sql
-- Actualizar el perfil del admin para que tenga rol 'admin'
update public.profiles
set
  role = 'admin',
  username = 'admin',
  full_name = 'Agente de Ventas C3',
  is_active = true
where id = (
  select id from auth.users where email = 'admin@c3nicaragua.com'
);

-- Verificar
select
  p.username,
  p.full_name,
  p.role,
  u.email
from public.profiles p
join auth.users u on p.id = u.id;
```

### Paso 7.3: Configurar políticas de Auth

Ve a **Authentication > Policies** (o **Settings > Auth**):

| Setting | Valor recomendado |
|---|---|
| **Site URL** | `https://tu-dominio.com` (o `http://localhost:5173` en dev) |
| **JWT expiry** | 3600 (1 hora) |
| **Enable email confirmations** | ❌ Desactivar (para pruebas) |
| **Enable sign ups** | ❌ Desactivar (solo tú creas admins) |

---

## ⚡ 8. Edge Functions: Email + WhatsApp

> 🎯 Las Edge Functions de Supabase son como microservicios serverless. Las usaremos para enviar emails cuando llegue una cotización.

### Paso 8.1: Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (con Scoop)
scoop install supabase

# npm (cualquier OS)
npm install -g supabase
```

### Paso 8.2: Inicializar Supabase en tu proyecto

```bash
# En la raíz de tu proyecto frontend
cd c3-nicaragua

# Iniciar sesión
supabase login

# Vincular a tu proyecto
supabase link --project-ref tu-project-ref

# Crear carpeta para edge functions
supabase functions new send-quotation-email
```

### Paso 8.3: Crear la Edge Function para email

Edita `supabase/functions/send-quotation-email/index.ts`:

```typescript
// supabase/functions/send-quotation-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SALES_EMAIL = Deno.env.get("SALES_EMAIL")!;

serve(async (req) => {
  // Solo permitir POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const quotation = await req.json();

    // Construir el HTML del email
    const itemsHtml = quotation.items.map((item: any) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">
          <strong>${item.product_name}</strong> ${item.capacity || ''}<br>
          <small>${item.product_code} · ${item.color} · Cant: ${item.quantity}</small>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">
          C$ ${(item.unit_price * item.quantity).toLocaleString('es-NI')}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#0A1B2A">🛒 Nueva Cotización C3 Nicaragua</h1>
        <p>Has recibido una nueva cotización a través del catálogo web.</p>

        <h2 style="color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:8px">👤 Cliente</h2>
        <p><strong>Nombre:</strong> ${quotation.customer_name}<br>
        <strong>Teléfono:</strong> ${quotation.customer_phone}<br>
        <strong>Email:</strong> ${quotation.customer_email || 'N/A'}</p>

        <h2 style="color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:8px">📦 Productos</h2>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Producto</th>
              <th style="padding:8px;text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h2 style="margin-top:20px;color:#00BFA6">
          💰 Total: C$ ${quotation.total.toLocaleString('es-NI')}
        </h2>
        <p>Tipo de precio aplicado: <strong>${quotation.price_type === 'distributor' ? '✅ Distribuidor' : 'ℹ️ Público'}</strong></p>

        ${quotation.customer_note ? `
          <h3 style="color:#2563EB">📝 Nota del cliente</h3>
          <p style="background:#fef3c7;padding:12px;border-radius:8px">${quotation.customer_note}</p>
        ` : ''}

        <p style="margin-top:30px;color:#666;font-size:12px">
          Cotización generada automáticamente desde el catálogo web.<br>
          Por favor contacta al cliente lo antes posible.
        </p>
      </body>
      </html>
    `;

    // Enviar con Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "C3 Nicaragua <cotizaciones@tudominio.com>",
        to: [SALES_EMAIL],
        subject: `🛒 Nueva cotización ${quotation.id} - C$ ${quotation.total.toLocaleString('es-NI')}`,
        html,
      }),
    });

    if (!res.ok) {
      throw new Error(`Resend error: ${await res.text()}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### Paso 8.4: Configurar variables secretas

```bash
# Configurar el API key de Resend
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email del agente
supabase secrets set SALES_EMAIL=ventas@c3nicaragua.com
```

> 💡 **Resend** tiene plan gratuito: 100 emails/día, 3,000/mes. Regístrate en [resend.com](https://resend.com).

### Paso 8.5: Desplegar la función

```bash
supabase functions deploy send-quotation-email --no-verify-jwt
```

Esto te dará una URL como:
```
https://tu-proyecto.supabase.co/functions/v1/send-quotation-email
```

### Paso 8.6: Trigger automático en la DB

Para que se ejecute automáticamente cada vez que se inserte una cotización, usamos **Database Webhooks** de Supabase:

1. Ve a **Database > Webhooks**.
2. Click en **"Create a new webhook"**.
3. Configurar:
   - **Name**: `send-quotation-email`
   - **Table**: `quotations`
   - **Events**: ✅ Insert
   - **Type**: `Supabase Edge Function`
   - **Function**: `send-quotation-email`
4. Click en **"Create webhook"**.

¡Listo! Ahora cada cotización nueva dispara automáticamente el email.

---

## 🔴 9. Real-time: cotizaciones en vivo

### Paso 9.1: Habilitar Realtime en la tabla

```sql
-- Habilitar realtime para cotizaciones
alter publication supabase_realtime add table public.quotations;
```

### Paso 9.2: Suscribirse en el frontend

```typescript
// En el panel admin
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Suscribirse a nuevas cotizaciones
const channel = supabase
  .channel('quotations-realtime')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'quotations' },
    (payload) => {
      console.log('¡Nueva cotización!', payload.new);
      // Reproducir sonido, mostrar notificación, etc.
      new Audio('/notification.mp3').play();
      alert(`¡Nueva cotización de ${payload.new.customer_name}!`);
    }
  )
  .subscribe();

// Limpiar al desmontar
return () => { supabase.removeChannel(channel); };
```

---

## 💻 10. Conectar el frontend a Supabase

### Paso 10.1: Instalar cliente de Supabase

```bash
npm install @supabase/supabase-js
```

### Paso 10.2: Crear el cliente

Crea `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Paso 10.3: Variables de entorno

Crea `.env`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...tu_anon_key
```

### Paso 10.4: Ejemplo — Obtener productos

```typescript
// src/services/products.ts
import { supabase } from '../lib/supabase';

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*)
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
```

### Paso 10.5: Ejemplo — Crear cotización (público)

```typescript
// src/services/quotations.ts
import { supabase } from '../lib/supabase';

export async function createQuotation(data) {
  const id = `COT-${Date.now().toString(36).toUpperCase()}`;

  // 1. Insertar cotización
  const { data: quotation, error: qError } = await supabase
    .from('quotations')
    .insert({
      id,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      customer_note: data.customerNote,
      subtotal: data.subtotal,
      total: data.total,
      price_type: data.priceType,
      status: 'nueva',
      source: 'web',
    })
    .select()
    .single();

  if (qError) throw qError;

  // 2. Insertar items
  const items = data.items.map((item: any) => ({
    quotation_id: id,
    product_id: item.productId,
    product_code: item.product.code,
    product_name: item.product.name,
    brand_name: item.product.brand,
    color: item.color,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.unitPrice * item.quantity,
  }));

  const { error: iError } = await supabase
    .from('quotation_items')
    .insert(items);

  if (iError) throw iError;

  return quotation;
}
```

### Paso 10.6: Ejemplo — Login del admin

```typescript
// src/services/auth.ts
import { supabase } from '../lib/supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

### Paso 10.7: Ejemplo — Subir imagen a Storage

```typescript
// src/services/storage.ts
import { supabase } from '../lib/supabase';

export async function uploadProductImage(file: File, productCode: string) {
  const ext = file.name.split('.').pop();
  const fileName = `${productCode}.${ext}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

---

## 🚀 11. Desplegar el frontend en Vercel

### Paso 11.1: Subir tu código a GitHub

1. Crea un repositorio en [github.com](https://github.com/new).
2. Sube tu código:

```bash
git init
git add .
git commit -m "Initial commit - C3 Nicaragua"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/c3-nicaragua.git
git push -u origin main
```

### Paso 11.2: Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Click en **"Add New... > Project"**.
3. Selecciona tu repositorio `c3-nicaragua`.
4. Click en **"Import"**.

### Paso 11.3: Configurar variables de entorno

En la sección **"Environment Variables"**, agrega:

```
VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

### Paso 11.4: Desplegar

1. Click en **"Deploy"**.
2. Espera 1-2 minutos.
3. ¡Listo! Vercel te dará una URL tipo `c3-nicaragua.vercel.app`.

### Paso 11.5: Dominio personalizado (opcional)

1. En Vercel, ve a **Settings > Domains**.
2. Agrega tu dominio (ej: `c3nicaragua.com`).
3. Configura los DNS según las instrucciones.

---

## 💰 Plan gratuito: límites y tips

### Límites del plan Free de Supabase

| Recurso | Límite Free | ¿Qué pasa si se excede? |
|---|---|---|
| **Base de datos** | 500 MB | Se pausa (no se borra). Upgrade a Pro ($25/mes) |
| **Storage** | 1 GB | Se pausa. Upgrade a Pro |
| **Transferencia** | 2 GB/mes | Se cobra el exceso |
| **Auth usuarios** | 50,000 MAU* | Se cobra el exceso |
| **Edge Functions** | 500,000 invocaciones/mes | Se cobra el exceso |
| **Realtime** | 200 conexiones simultáneas | Se cobra el exceso |

*MAU = Monthly Active Users

### Tips para no pasarte del Free Tier

1. **Imágenes**: comprime las imágenes a < 200 KB antes de subirlas. Usa formato WebP.
2. **Logs antiguos**: Supabase guarda 1 semana de logs gratis. Limpia con `vacuum full` periódico.
3. **Backups**: el plan Free NO incluye backups automáticos. Haz snapshots manuales desde el dashboard antes de cualquier cambio importante.
4. **Monitoreo**: revisa tu uso en **Settings > Usage** mensualmente.

### Cuándo migrar a Pro ($25/mes)

- Más de 500 MB de base de datos
- Más de 50,000 MAU
- Necesitas backups automáticos diarios
- Quieres soporte prioritario

---

## ✅ Checklist final

- [ ] Cuenta de Supabase creada
- [ ] Proyecto `c3-nicaragua` creado
- [ ] 7 tablas creadas (`brands`, `categories`, `products`, `quotations`, `quotation_items`, `site_config`, `profiles`)
- [ ] Datos seed insertados (7 marcas, 7 categorías, 21 productos, 6 configs)
- [ ] Row Level Security habilitado y políticas creadas
- [ ] Bucket `product-images` creado en Storage
- [ ] Usuario admin creado en Authentication
- [ ] Perfil admin con rol `admin`
- [ ] Edge Function `send-quotation-email` desplegada
- [ ] Webhook configurado para enviar email automático
- [ ] Realtime habilitado en `quotations`
- [ ] Frontend conectado a Supabase (variables de entorno)
- [ ] Frontend desplegado en Vercel
- [ ] Probado: crear cotización desde el frontend
- [ ] Recibido: email en la bandeja del agente
- [ ] Recibido: cotización en el panel admin

---

## 🆘 Solución de problemas comunes

### ❌ "permission denied for table products"
- Verifica que la política RLS está creada. Ve a **Authentication > Policies**.
- Si estás autenticado, asegúrate de que tu perfil tiene `role = 'admin'`.

### ❌ "new row violates row-level security policy"
- La política RLS está bloqueando el INSERT. Verifica que el `with check` permite la operación.

### ❌ El email no llega
- Ve a **Edge Functions > Logs** y revisa si hay errores.
- Verifica que el API key de Resend es válido.
- Revisa la carpeta de SPAM.

### ❌ Storage: "new row violates row-level security policy"
- Verifica que las políticas del bucket están creadas (Paso 6.2).

### ❌ Real-time no actualiza
- Verifica que ejecutaste `alter publication supabase_realtime add table public.quotations;`
- Revisa la consola del navegador por errores de WebSocket.

### ❌ "Invalid API key"
- Verifica que copiaste bien las variables de entorno.
- En Vercel, redeploya después de cambiar las variables.

---

## 📞 Soporte

- **Documentación oficial**: [https://supabase.com/docs](https://supabase.com/docs)
- **Discord de Supabase**: [https://discord.supabase.com](https://discord.supabase.com)
- **Foro**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

---

**¡Listo! Tu backend de C3 Nicaragua está en Supabase (gratis) y tu frontend en Vercel (gratis). Total: $0/mes 🎉**
