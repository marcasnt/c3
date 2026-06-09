# 🚀 Implementación de Base de Datos en Amazon RDS

## C3 Nicaragua - Paso a Paso Detallado

---

## 📋 Tabla de Contenidos

1. [Requisitos previos](#-requisitos-previos)
2. [Crear cuenta en AWS](#-1-crear-cuenta-en-aws)
3. [Crear instancia RDS PostgreSQL](#-2-crear-instancia-rds-postgresql)
4. [Configurar seguridad y acceso](#-3-configurar-seguridad-y-acceso)
5. [Conectarse a la base de datos](#-4-conectarse-a-la-base-de-datos)
6. [Crear el esquema completo (SQL)](#-5-crear-el-esquema-completo-sql)
7. [Inyectar datos de prueba (Seed)](#-6-inyectar-datos-de-prueba-seed)
8. [Crear usuario de aplicación](#-7-crear-usuario-de-aplicación)
9. [Configurar backups automáticos](#-8-configurar-backups-automáticos)
10. [Conectar el backend a RDS](#-9-conectar-el-backend-a-rds)
11. [Monitoreo y mantenimiento](#-10-monitoreo-y-mantenimiento)
12. [Costos estimados](#-costos-estimados)

---

## ✅ Requisitos previos

Antes de empezar, asegúrate de tener:

- [x] Una cuenta de correo electrónico válida
- [x] Una tarjeta de crédito o débito (AWS te cobrará, pero puedes usar el **Free Tier**)
- [x] Conocimientos básicos de SQL y línea de comandos
- [x] Una VPC o la VPC por defecto de AWS
- [x] (Opcional) Un cliente SQL como **DBeaver**, **pgAdmin** o **TablePlus**

---

## 🔐 1. Crear cuenta en AWS

### Paso 1.1: Ir a la consola de AWS
Abre tu navegador y ve a: [https://aws.amazon.com/](https://aws.amazon.com/)

### Paso 1.2: Crear cuenta nueva
1. Click en **"Crear una cuenta de AWS"** (esquina superior derecha).
2. Ingresa tu **correo electrónico**, **nombre de cuenta** y **contraseña**.
3. Click en **"Continuar"**.

### Paso 1.3: Verificar correo electrónico
- AWS te enviará un código de verificación a tu correo.
- Ingrésalo y continúa.

### Paso 1.4: Configurar contacto
- Selecciona **"Personal"** o **"Empresa"** según tu caso.
- Completa los datos solicitados (nombre, teléfono, país).

### Paso 1.5: Configurar método de pago
- Ingresa una tarjeta de crédito/débito válida.
- AWS puede hacer un cargo de verificación de $1 USD (se devuelve automáticamente).

### Paso 1.6: Verificar identidad por teléfono
- AWS te llamará y te pedirá un PIN de 4 dígitos que aparece en pantalla.
- Ingresa el PIN cuando te lo soliciten.

### Paso 1.7: Seleccionar plan de soporte
- Recomendado: **Plan Basic (gratuito)** para empezar.

### Paso 1.8: Acceder a la consola
- Click en **"Ir a la consola de AWS"**.
- Ya tienes tu cuenta creada.

---

## 🗄️ 2. Crear instancia RDS PostgreSQL

### Paso 2.1: Ir al servicio RDS
1. En la consola de AWS, en el buscador superior, escribe **"RDS"**.
2. Click en **"RDS"** (Relational Database Service).

### Paso 2.2: Crear base de datos
1. Click en el botón naranja **"Crear base de datos"** (Create database).

### Paso 2.3: Elegir método de creación
Selecciona: **"Creación estándar"** (Standard Create) — te da más control.

### Paso 2.4: Configuración del motor
- **Tipo de motor**: `PostgreSQL`
- **Versión**: Selecciona la última versión estable (ej: `PostgreSQL 16.x` o `15.x`)
- **Plantillas**:
  - Para **pruebas/dev**: elige **"Nivel gratuito"** (Free tier) — `db.t3.micro`
  - Para **producción**: elige **"Producción"** — `db.t3.small` o superior

### Paso 2.5: Configuración de la instancia
Completa los siguientes campos:

| Campo | Valor recomendado | Descripción |
|---|---|---|
| **Identificador de instancias de DB** | `c3-nicaragua-db` | Nombre único de tu instancia |
| **Nombre de usuario maestro** | `c3_admin` | Usuario administrador (NO uses "admin") |
| **Contraseña maestro** | `C3Nicaragua2026!Segura` | Genera una contraseña fuerte |
| **Confirmar contraseña** | Repetir la misma | Confirmación |

> 💡 **Tip**: Click en el icono de dado para que AWS genere una contraseña automática. **¡Guárdala en un lugar seguro!**

### Paso 2.6: Configuración de la instancia (tamaño)

#### Si elegiste Free Tier:
- **Clase de instancia**: `db.t3.micro` (1 vCPU, 1 GB RAM)
- **Tipo de almacenamiento**: `gp2` (SSD)
- **Almacenamiento asignado**: `20 GB`

#### Si elegiste Producción:
- **Clase de instancia**: `db.t3.small` (2 vCPU, 2 GB RAM) — mínimo recomendado
- **Tipo de almacenamiento**: `gp3` (SSD de última generación)
- **Almacenamiento asignado**: `50 GB` (puedes escalar después)
- **Rendimiento de almacenamiento**: `3000 IOPS`
- **Habilitar escalado automático**: ✅ Sí, hasta `200 GB`

### Paso 2.7: Configuración de conectividad

| Campo | Valor | Por qué |
|---|---|---|
| **Nube privada virtual (VPC)** | VPC por defecto | Para empezar es suficiente |
| **Grupo de subred** | default | Todas las subredes disponibles |
| **Acceso público** | **Sí** (para pruebas) o **No** (para prod) | Si es No, solo accesible desde tu VPC |
| **Grupo de seguridad de VPC** | Crear nuevo | Lo configuraremos en el siguiente paso |
| **Puerto** | `5432` | Puerto por defecto de PostgreSQL |
| **Zona de disponibilidad** | No preference | AWS elige la mejor |

> ⚠️ **Importante**: Si tu backend está en EC2/ECS/Lambda en la misma VPC, elige **"No"** en acceso público. Si necesitas conectarte desde tu PC local, elige **"Sí"** y configura bien el Security Group.

### Paso 2.8: Autenticación
- **Método de autenticación**: **"Autenticación de contraseña"** (Password authentication)

### Paso 2.9: Configuración adicional

| Campo | Valor recomendado |
|---|---|
| **Protección contra eliminación** | ✅ Habilitar (para evitar borrado accidental) |
| **Copias de seguridad automatizadas** | ✅ Habilitar |
| **Período de retención de backups** | `7 días` (mínimo), `30 días` (recomendado prod) |
| **Ventana de backup** | Cualquiera (AWS elige) |
| **Cifrado en reposo** | ✅ Habilitar (KMS key por defecto) |
| **Performance Insights** | ✅ Habilitar (gratuito los primeros 7 días) |
| **Monitoreo mejorado** | ❌ Deshabilitar (tiene costo) |
| **Mantenimiento automático** | ✅ Habilitar |
| **Ventana de mantenimiento** | Domingo 03:00-04:00 AM |

### Paso 2.10: Revisar y crear
1. Revisa toda la configuración.
2. Click en **"Crear base de datos"**.

### Paso 2.11: Esperar (5-10 minutos)
AWS tardará unos minutos en provisionar la instancia. Verás el estado como **"Creando"** → **"Modificando"** → **"Disponible"**.

---

## 🔒 3. Configurar seguridad y acceso

### Paso 3.1: Crear/Editar Security Group
1. Ve a **EC2 > Grupos de seguridad** (en el menú de AWS).
2. Busca el grupo de seguridad asociado a tu RDS (lo creaste en el paso 2.7).
3. Click en el **ID del grupo de seguridad**.

### Paso 3.2: Configurar reglas de entrada (Inbound)
1. Click en **"Editar reglas de entrada"**.
2. Agrega las siguientes reglas:

#### Regla 1: Acceso desde tu PC local (solo para desarrollo)
| Campo | Valor |
|---|---|
| **Tipo** | PostgreSQL |
| **Protocolo** | TCP |
| **Rango de puertos** | 5432 |
| **Origen** | `Mi IP` (recomendado) o tu IP pública específica |

#### Regla 2: Acceso desde la VPC (para backend en EC2/ECS)
| Campo | Valor |
|---|---|
| **Tipo** | PostgreSQL |
| **Protocolo** | TCP |
| **Rango de puertos** | 5432 |
| **Origen** | `10.0.0.0/16` (CIDR de tu VPC) o el Security Group de tu backend |

3. Click en **"Guardar reglas"**.

> 🔐 **Buena práctica**: En producción, NUNCA expongas el puerto 5432 a `0.0.0.0/0`. Usa siempre IPs específicas o Security Groups referenciados.

### Paso 3.3: Habilitar acceso público (si es necesario)
Si necesitas conectarte desde tu PC local:
1. Ve a **RDS > Bases de datos > tu-instancia**.
2. Click en **"Modificar"**.
3. En **Conectividad**, cambia **"Acceso público"** a **"Sí"**.
4. Click en **"Continuar"** → **"Aplicar inmediatamente"**.

---

## 🔌 4. Conectarse a la base de datos

### Paso 4.1: Obtener el endpoint
1. Ve a **RDS > Bases de datos**.
2. Click en el nombre de tu instancia (`c3-nicaragua-db`).
3. En la sección **"Conectividad y seguridad"**, copia el **Endpoint** y el **Puerto**.

Ejemplo de endpoint:
```
c3-nicaragua-db.xxxxx.us-east-1.rds.amazonaws.com
```

### Paso 4.2: Conectarse desde DBeaver (recomendado)

1. **Descargar DBeaver**: [https://dbeaver.io/download/](https://dbeaver.io/download/)
2. Abrir DBeaver.
3. Click en **"Nueva conexión"** (icono de enchufe).
4. Selecciona **PostgreSQL** → Next.
5. Completa:

| Campo | Valor |
|---|---|
| **Host** | `c3-nicaragua-db.xxxxx.us-east-1.rds.amazonaws.com` |
| **Port** | `5432` |
| **Database** | `c3_nicaragua` (la crearemos en el siguiente paso) |
| **Username** | `c3_admin` |
| **Password** | Tu contraseña maestra |

6. Click en **"Test Connection"** para verificar.
7. Click en **"Finish"**.

### Paso 4.3: Conectarse desde psql (terminal)

```bash
psql \
  -h c3-nicaragua-db.xxxxx.us-east-1.rds.amazonaws.com \
  -p 5432 \
  -U c3_admin \
  -d postgres
```

Te pedirá la contraseña. Si está todo bien, verás:
```
c3_nicaragua=>
```

### Paso 4.4: Conectarse desde pgAdmin

1. Abrir pgAdmin.
2. Click derecho en **"Servers" > Create > Server**.
3. En la pestaña **General**, dale un nombre: `C3 Nicaragua RDS`.
4. En la pestaña **Connection**:
   - **Host**: tu endpoint
   - **Port**: 5432
   - **Database**: `postgres`
   - **Username**: `c3_admin`
   - **Password**: tu contraseña
5. Click en **"Save"**.

---

## 🏗️ 5. Crear el esquema completo (SQL)

> 📌 **Importante**: Ejecuta estos scripts en orden. El primer bloque crea la base de datos. Los siguientes crean las tablas, índices, triggers y datos.

### Paso 5.1: Crear la base de datos

Conéctate a la base de datos por defecto `postgres` y ejecuta:

```sql
-- Crear la base de datos
CREATE DATABASE c3_nicaragua
    WITH
    OWNER = c3_admin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Conectarse a la nueva base de datos
\c c3_nicaragua

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

> 💡 En DBeaver, selecciona la base de datos `c3_nicaragua` en el panel izquierdo y luego ejecuta los siguientes scripts.

---

### Paso 5.2: TABLA — `brands` (Marcas)

```sql
-- =====================================================
-- 1. TABLA: brands (Marcas de productos)
-- =====================================================
DROP TABLE IF EXISTS brands CASCADE;

CREATE TABLE brands (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    slug        VARCHAR(50) UNIQUE NOT NULL,
    color_hex   VARCHAR(7) NOT NULL,
    logo_text   VARCHAR(50) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_active ON brands(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE brands IS 'Marcas de productos (Stanley, YETI, Owala, etc.)';
```

---

### Paso 5.3: TABLA — `categories` (Categorías)

```sql
-- =====================================================
-- 2. TABLA: categories (Categorías de productos)
-- =====================================================
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(80) UNIQUE NOT NULL,
    slug        VARCHAR(80) UNIQUE NOT NULL,
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INT DEFAULT 0
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_categories_sort ON categories(sort_order);

COMMENT ON TABLE categories IS 'Categorías de productos';
```

---

### Paso 5.4: TABLA — `products` (Productos)

```sql
-- =====================================================
-- 3. TABLA: products (Productos del catálogo)
-- =====================================================
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(50) UNIQUE NOT NULL,
    name                VARCHAR(200) NOT NULL,
    brand_id            INT NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    category_id         INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    capacity            VARCHAR(20),
    price_public        NUMERIC(10,2) NOT NULL CHECK (price_public >= 0),
    price_distributor   NUMERIC(10,2) NOT NULL CHECK (price_distributor >= 0),
    description         TEXT,
    features            JSONB DEFAULT '[]'::JSONB,
    colors              JSONB DEFAULT '[]'::JSONB,
    stock               INT DEFAULT 0 CHECK (stock >= 0),
    is_featured         BOOLEAN DEFAULT FALSE,
    is_new              BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    packaging           VARCHAR(200),
    image_url           TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_new ON products(is_new) WHERE is_new = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_search ON products USING GIN (
    to_tsvector('spanish', name || ' ' || code || ' ' || capacity)
);
CREATE INDEX idx_products_price ON products(price_public, price_distributor);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE products IS 'Catálogo de productos de C3 Nicaragua';
COMMENT ON COLUMN products.colors IS 'Array JSON: [{"name":"Negro","hex":"#1A1A1A"}]';
COMMENT ON COLUMN products.features IS 'Array JSON de características del producto';
```

---

### Paso 5.5: TABLA — `users` (Usuarios administrativos)

```sql
-- =====================================================
-- 4. TABLA: users (Usuarios admin / agentes de ventas)
-- =====================================================
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(150) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agente', 'supervisor')),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE users IS 'Usuarios del panel administrativo (agentes de ventas)';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt de la contraseña';
```

---

### Paso 5.6: TABLA — `quotations` (Cotizaciones)

```sql
-- =====================================================
-- 5. TABLA: quotations (Cotizaciones generadas)
-- =====================================================
DROP TYPE IF EXISTS quotation_status CASCADE;

CREATE TYPE quotation_status AS ENUM ('nueva', 'contactado', 'cerrada', 'cancelada');

DROP TABLE IF EXISTS quotation_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;

CREATE TABLE quotations (
    id              VARCHAR(50) PRIMARY KEY,
    customer_name   VARCHAR(200) NOT NULL,
    customer_phone  VARCHAR(30) NOT NULL,
    customer_email  VARCHAR(200),
    customer_note   TEXT,
    subtotal        NUMERIC(12,2) NOT NULL,
    total           NUMERIC(12,2) NOT NULL,
    price_type      VARCHAR(20) DEFAULT 'public' CHECK (price_type IN ('public', 'distributor')),
    status          quotation_status DEFAULT 'nueva',
    assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
    internal_notes  TEXT,
    source          VARCHAR(50) DEFAULT 'web',  -- web, whatsapp, email, manual
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    contacted_at    TIMESTAMPTZ,
    closed_at       TIMESTAMPTZ
);

CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created ON quotations(created_at DESC);
CREATE INDEX idx_quotations_phone ON quotations(customer_phone);
CREATE INDEX idx_quotations_assigned ON quotations(assigned_to);
CREATE INDEX idx_quotations_email ON quotations(customer_email) WHERE customer_email IS NOT NULL;
CREATE INDEX idx_quotations_price_type ON quotations(price_type);
CREATE INDEX idx_quotations_source ON quotations(source);

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON quotations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE quotations IS 'Cotizaciones generadas por clientes (públicas) y rastreadas por el admin';
```

---

### Paso 5.7: TABLA — `quotation_items` (Items de cotización)

```sql
-- =====================================================
-- 6. TABLA: quotation_items (Items/productos dentro de cada cotización)
-- =====================================================
CREATE TABLE quotation_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id    VARCHAR(50) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_code    VARCHAR(50) NOT NULL,
    product_name    VARCHAR(200) NOT NULL,
    brand_name      VARCHAR(50) NOT NULL,
    color           VARCHAR(100) NOT NULL,
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2) NOT NULL,
    line_total      NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_product ON quotation_items(product_id);

COMMENT ON TABLE quotation_items IS 'Líneas/items dentro de cada cotización';
```

---

### Paso 5.8: TABLA — `site_config` (Configuración del sitio)

```sql
-- =====================================================
-- 7. TABLA: site_config (Configuración key-value del sitio)
-- =====================================================
DROP TABLE IF EXISTS site_config CASCADE;

CREATE TABLE site_config (
    key             VARCHAR(100) PRIMARY KEY,
    value           JSONB NOT NULL,
    description     TEXT,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_by      UUID REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE site_config IS 'Configuración dinámica del sitio (WhatsApp, email, reglas, etc.)';
```

---

### Paso 5.9: TABLA — `audit_log` (Log de auditoría)

```sql
-- =====================================================
-- 8. TABLA: audit_log (Registro de auditoría)
-- =====================================================
DROP TABLE IF EXISTS audit_log CASCADE;

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,   -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    entity_type     VARCHAR(50) NOT NULL,   -- product, quotation, user, etc.
    entity_id       VARCHAR(100),
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);

COMMENT ON TABLE audit_log IS 'Registro de auditoría de todas las acciones del panel admin';
```

---

### Paso 5.10: Verificar que todas las tablas se crearon

```sql
-- Ver todas las tablas creadas
\dt

-- O en SQL puro:
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar las foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
```

**Resultado esperado** — deberías ver estas 8 tablas:

```
audit_log
brands
categories
products
quotation_items
quotations
site_config
users
```

---

## 🌱 6. Inyectar datos de prueba (Seed)

> 📌 Ejecuta este script completo en la base de datos `c3_nicaragua`. Inserta todas las marcas, categorías, productos de muestra y la configuración inicial.

### Paso 6.1: Insertar marcas

```sql
-- =====================================================
-- SEED: Marcas
-- =====================================================
INSERT INTO brands (name, slug, color_hex, logo_text) VALUES
('Stanley',   'stanley',   '#1B1B1B', 'STANLEY'),
('YETI',      'yeti',      '#0F4C81', 'YETI'),
('Owala',     'owala',     '#9333EA', 'owala'),
('Lululemon', 'lululemon', '#C9082A', 'lululemon'),
('Thermos',   'thermos',   '#DC2626', 'THERMOS'),
('Disney',    'disney',    '#1E40AF', 'Disney'),
('Genéricos', 'genericos', '#0A1B2A', 'GENÉRICOS')
ON CONFLICT (name) DO NOTHING;
```

### Paso 6.2: Insertar categorías

```sql
-- =====================================================
-- SEED: Categorías
-- =====================================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Todos los vasos',  'todos',          'Todos los productos',            0),
('Con tapa y popote','tapa-popote',    'Vasos con popote integrado',     1),
('Con asa',          'con-asa',        'Vasos con asa de transporte',    2),
('Botellas',         'botellas',       'Botellas térmicas clásicas',     3),
('Kids / Disney',    'kids-disney',    'Productos para niños y Disney',  4),
('Genéricos',        'genericos',      'Línea genérica para sublimar',   5),
('Accesorios',       'accesorios',     'Popotes, tapas y más',           6)
ON CONFLICT (name) DO NOTHING;
```

### Paso 6.3: Insertar productos (catálogo completo)

```sql
-- =====================================================
-- SEED: Productos (catálogo completo de 21 productos)
-- =====================================================

-- ============ STANLEY ============
INSERT INTO products (code, name, brand_id, category_id, capacity, price_public, price_distributor, colors, features, stock, is_featured, is_new, packaging, description) VALUES
('ST-QUENCH-40', 'Stanley Quencher H2.0', 1, 3, '40 oz', 1450, 870,
  '[{"name":"Blanco Crema","hex":"#F5F1E8"},{"name":"Rosa Palo","hex":"#E8B4B8"},{"name":"Negro Mate","hex":"#1A1A1A"},{"name":"Verde Salvia","hex":"#9CAF88"},{"name":"Azul Cielo","hex":"#87CEEB"}]'::jsonb,
  '["Aislamiento al vacío de doble pared","Tapa FlowState™ 3 posiciones","Compatible con portavasos","Acero inoxidable 18/8 reciclado","Libre de BPA"]'::jsonb,
  35, TRUE, TRUE, 'Caja individual con sticker oficial',
  'El vaso térmico icónico de Stanley con aislamiento al vacío de doble pared. Mantiene tus bebidas frías por 11 horas y calientes por 7 horas.'),

('ST-QUENCH-30', 'Stanley Quencher H2.0', 1, 3, '30 oz', 1290, 780,
  '[{"name":"Blanco Crema","hex":"#F5F1E8"},{"name":"Negro Mate","hex":"#1A1A1A"},{"name":"Lila","hex":"#C8A2C8"},{"name":"Verde Menta","hex":"#98D8C8"}]'::jsonb,
  '["Aislamiento de doble pared","Tapa FlowState™","Base ergonómica","Acero reciclado 18/8"]'::jsonb,
  28, TRUE, FALSE, 'Caja individual',
  'Versión compacta del Quencher, perfecta para el día a día.'),

('ST-FLIP-20', 'Stanley Flip Straw', 1, 2, '20 oz', 950, 580,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Verde","hex":"#2D5F3F"},{"name":"Rosa","hex":"#FFB6C1"}]'::jsonb,
  '["Popote abatible integrado","Aislamiento doble pared","A prueba de fugas","Asa de transporte"]'::jsonb,
  40, FALSE, FALSE, 'Caja individual',
  'Vaso con popote abatible, ideal para hidratarse fácilmente.'),

('ST-ICEFLOW-30', 'Stanley IceFlow Flip', 1, 2, '30 oz', 1180, 710,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Azul Marino","hex":"#1E3A5F"}]'::jsonb,
  '["Popote flip integrado","Aislamiento al vacío","Asa ergonómica","Apto para lavavajillas"]'::jsonb,
  32, FALSE, TRUE, 'Caja individual',
  'Vaso con popote flip y aislamiento al vacío.'),

('ST-ADV-24', 'Stanley Adventure', 1, 4, '24 oz', 880, 530,
  '[{"name":"Verde Hunter","hex":"#2D4A2B"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Naranja","hex":"#FF6B35"}]'::jsonb,
  '["Acero 18/8","Tapa hermética","Aislamiento doble pared","Garantía de por vida"]'::jsonb,
  25, FALSE, FALSE, 'Caja individual',
  'Botella térmica clásica de Stanley, resistente y duradera.'),

-- ============ YETI ============
('YT-RAMBLER-30', 'YETI Rambler', 2, 3, '30 oz', 1300, 780,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Blanco","hex":"#FFFFFF"},{"name":"Gris Carbón","hex":"#3A3A3A"},{"name":"Azul Marino","hex":"#0F2C4D"},{"name":"Verde Bosque","hex":"#2D4A2B"}]'::jsonb,
  '["Aislamiento al vacío de doble pared","Acero inoxidable 18/8","Acabado DuraCoat™","No sudada al tacto","Base antideslizante"]'::jsonb,
  30, TRUE, FALSE, 'Caja YETI oficial',
  'El vaso YETI Rambler con asa, combinación perfecta de resistencia y aislamiento.'),

('YT-RAMBLER-20', 'YETI Rambler', 2, 4, '20 oz', 1050, 630,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Blanco","hex":"#FFFFFF"},{"name":"Gris","hex":"#6B6B6B"},{"name":"Verde","hex":"#2D4A2B"}]'::jsonb,
  '["Aislamiento al vacío","Acero 18/8","Tapa MagSlider™","Resistente a caídas"]'::jsonb,
  22, FALSE, FALSE, 'Caja YETI oficial',
  'Tamaño compacto con la misma potencia térmica YETI.'),

('YT-COLSTER', 'YETI Rambler Colster', 2, 4, '12 oz', 580, 350,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Blanco","hex":"#FFFFFF"},{"name":"Azul","hex":"#1E40AF"}]'::jsonb,
  '["Aislamiento al vacío","Capacidad 12 oz","Anticondensación","Base estable"]'::jsonb,
  50, FALSE, FALSE, 'Caja YETI oficial',
  'Mantén tus latas y botellas siempre frías.'),

-- ============ OWALA ============
('OW-FREESIP-32', 'Owala FreeSip', 3, 2, '32 oz', 1250, 780,
  '[{"name":"Lila Sueño","hex":"#C8A2C8"},{"name":"Verde Menta","hex":"#98D8C8"},{"name":"Blanco Nube","hex":"#FFFFFF"},{"name":"Rosa Bebé","hex":"#FFB6C1"},{"name":"Azul Cielo","hex":"#87CEEB"}]'::jsonb,
  '["Boquilla FreeSip patentada","Popote oculto integrado","Aislamiento triple pared","Asa de transporte","Libre de BPA"]'::jsonb,
  38, TRUE, TRUE, 'Caja Owala oficial',
  'Innovadora botella con boquilla FreeSip patentada: bebe con popote o directamente.'),

('OW-FREESIP-24', 'Owala FreeSip', 3, 2, '24 oz', 990, 610,
  '[{"name":"Lila","hex":"#C8A2C8"},{"name":"Verde","hex":"#98D8C8"},{"name":"Blanco","hex":"#FFFFFF"},{"name":"Rosa","hex":"#FFB6C1"}]'::jsonb,
  '["Boquilla FreeSip","Triple aislamiento","Popote oculto","A prueba de fugas"]'::jsonb,
  45, FALSE, FALSE, 'Caja Owala oficial',
  'Versión mediana de la FreeSip.'),

('OW-TWIST-20', 'Owala Twist', 3, 4, '20 oz', 850, 510,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Verde","hex":"#98D8C8"}]'::jsonb,
  '["Tapa twist de un giro","Aislamiento doble","Boquilla ergonómica","Asa integrada"]'::jsonb,
  30, FALSE, FALSE, 'Caja Owala oficial',
  'Botella con tapa twist de un giro.'),

-- ============ LULULEMON ============
('LL-BACKLIFE-24', 'Lululemon Back to Life', 4, 3, '24 oz', 1350, 810,
  '[{"name":"Blanco Hueso","hex":"#F5F1E8"},{"name":"Gris Piedra","hex":"#8B8680"},{"name":"Negro Suave","hex":"#2A2A2A"},{"name":"Verde Salvia","hex":"#9CAF88"}]'::jsonb,
  '["Acabado mate premium","Aislamiento al vacío","Tapa antipérdida","Asa ergonómica","Libre de BPA"]'::jsonb,
  20, TRUE, FALSE, 'Caja Lululemon premium',
  'Vaso térmico premium de Lululemon, diseñado para el estilo de vida activo.'),

('LL-BACKLIFE-32', 'Lululemon Back to Life', 4, 3, '32 oz', 1550, 930,
  '[{"name":"Blanco Hueso","hex":"#F5F1E8"},{"name":"Gris Piedra","hex":"#8B8680"},{"name":"Negro","hex":"#1A1A1A"}]'::jsonb,
  '["Capacidad 32 oz","Acabado mate","Aislamiento al vacío","Tapa antiderrame"]'::jsonb,
  18, FALSE, TRUE, 'Caja Lululemon premium',
  'Capacidad extendida con el mismo diseño premium.'),

-- ============ THERMOS ============
('TH-KING-16', 'Thermos King', 5, 4, '16 oz', 720, 430,
  '[{"name":"Negro Mate","hex":"#1A1A1A"},{"name":"Acero Pulido","hex":"#C0C0C0"},{"name":"Azul Medianoche","hex":"#191970"}]'::jsonb,
  '["Aislamiento al vacío","24h frío / 12h caliente","Tapa con vaso","Acero 18/8"]'::jsonb,
  40, TRUE, FALSE, 'Caja Thermos oficial',
  'Botella Thermos King, la clásica que no pasa de moda.'),

('TH-FUNTAINER-12', 'Thermos Funtainer', 5, 5, '12 oz', 580, 350,
  '[{"name":"Rosa","hex":"#FFB6C1"},{"name":"Azul","hex":"#87CEEB"},{"name":"Verde","hex":"#98D8C8"}]'::jsonb,
  '["Para niños","Popote integrado","Aislamiento al vacío","12h frío"]'::jsonb,
  35, FALSE, FALSE, 'Caja Thermos',
  'Botella térmica para niños con diseños divertidos.'),

('TH-INTL-24', 'Thermos Stainless King', 5, 3, '24 oz', 950, 570,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Acero","hex":"#C0C0C0"}]'::jsonb,
  '["24 oz","Asa ergonómica","Tapa antiderrame","Aislamiento doble"]'::jsonb,
  28, FALSE, FALSE, 'Caja Thermos',
  'Vaso térmico de gran capacidad con asa.'),

-- ============ DISNEY ============
('DS-MICKEY-24', 'Disney Mickey Tumbler', 6, 5, '24 oz', 650, 390,
  '[{"name":"Rojo Mickey","hex":"#E63946"},{"name":"Negro Mickey","hex":"#1A1A1A"},{"name":"Rosa Minnie","hex":"#FFB6C1"}]'::jsonb,
  '["Diseño oficial Disney","Aislamiento al vacío","Popote incluido","24 oz capacidad"]'::jsonb,
  50, TRUE, TRUE, 'Caja Disney oficial',
  'Vaso oficial de Disney con diseños de Mickey y Minnie.'),

('DS-PRINCESA-16', 'Disney Princesas', 6, 5, '16 oz', 520, 310,
  '[{"name":"Rosa","hex":"#FFB6C1"},{"name":"Lila","hex":"#C8A2C8"},{"name":"Celeste","hex":"#87CEEB"}]'::jsonb,
  '["Diseños princesas","Asa lateral","Popote incluido","Apto niños"]'::jsonb,
  42, FALSE, FALSE, 'Caja Disney oficial',
  'Vaso con diseños de princesas Disney.'),

('DS-STARWARS-20', 'Disney Star Wars', 6, 5, '20 oz', 620, 380,
  '[{"name":"Negro Imperial","hex":"#1A1A1A"},{"name":"Gris Jedi","hex":"#6B6B6B"}]'::jsonb,
  '["Diseño Star Wars","20 oz","Tapa con popote","Aislamiento térmico"]'::jsonb,
  38, FALSE, TRUE, 'Caja Disney oficial',
  'Vaso Star Wars para los fans de la saga.'),

-- ============ GENÉRICOS ============
('GN-STD-30', 'Vaso Genérico Premium', 7, 6, '30 oz', 520, 310,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Azul","hex":"#2563EB"},{"name":"Rosa","hex":"#FFB6C1"},{"name":"Verde","hex":"#10B981"},{"name":"Amarillo","hex":"#FBBF24"}]'::jsonb,
  '["Ideal para sublimar","Acero 18/8","Aislamiento doble","Asa ergonómica","Múltiples colores"]'::jsonb,
  80, TRUE, FALSE, 'Embalaje individual',
  'Vaso térmico genérico de alta calidad, ideal para personalización.'),

('GN-STD-20', 'Vaso Genérico Clásico', 7, 6, '20 oz', 380, 230,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Azul","hex":"#2563EB"},{"name":"Rosa","hex":"#FFB6C1"},{"name":"Verde","hex":"#10B981"}]'::jsonb,
  '["Para sublimar","Acero inoxidable","Tapa transparente","20 oz"]'::jsonb,
  100, FALSE, FALSE, 'Embalaje individual',
  'Vaso genérico de 20 oz, perfecto para regalos corporativos.'),

('GN-STD-40', 'Vaso Genérico XL', 7, 6, '40 oz', 620, 380,
  '[{"name":"Blanco","hex":"#FFFFFF"},{"name":"Negro","hex":"#1A1A1A"},{"name":"Azul","hex":"#2563EB"},{"name":"Verde","hex":"#10B981"}]'::jsonb,
  '["40 oz","Asa robusta","Tapa con popote","Para personalizar"]'::jsonb,
  60, FALSE, FALSE, 'Embalaje individual',
  'Vaso de gran capacidad 40 oz, ideal para deportistas.'),

('GN-KIDS-12', 'Vaso Kids Genérico', 7, 5, '12 oz', 320, 190,
  '[{"name":"Rosa","hex":"#FFB6C1"},{"name":"Azul","hex":"#87CEEB"},{"name":"Verde","hex":"#98D8C8"},{"name":"Amarillo","hex":"#FBBF24"}]'::jsonb,
  '["Tamaño infantil","Popote incluido","Asa lateral","A prueba de fugas"]'::jsonb,
  70, FALSE, FALSE, 'Embalaje individual',
  'Vaso térmico para niños con diseños personalizables.')

ON CONFLICT (code) DO NOTHING;
```

### Paso 6.4: Insertar configuración inicial del sitio

```sql
-- =====================================================
-- SEED: Configuración del sitio
-- =====================================================
INSERT INTO site_config (key, value, description) VALUES
('whatsapp_number',    '"+50588888888"'::jsonb,                 'Número de WhatsApp de ventas (formato internacional)'),
('sales_email',        '"ventas@c3nicaragua.com"'::jsonb,        'Email del agente que recibe notificaciones'),
('company_name',       '"C3 Nicaragua"'::jsonb,                  'Nombre de la empresa'),
('address',            '"Managua, Nicaragua"'::jsonb,            'Dirección de la empresa'),
('min_distributor_qty','5'::jsonb,                               'Cantidad mínima de unidades para aplicar precio distribuidor'),
('min_admin_password', '"c3nicaragua2026"'::jsonb,                'Contraseña inicial del admin (solo referencia)')
ON CONFLICT (key) DO NOTHING;
```

### Paso 6.5: Insertar usuario admin (con hash bcrypt)

> 📌 **Importante**: El siguiente hash es un ejemplo. En producción, genera tu propio hash con bcrypt.

```sql
-- =====================================================
-- SEED: Usuario administrador
-- =====================================================
-- Password: c3nicaragua2026
-- Hash bcrypt generado con cost 10
-- Para generar uno nuevo en Node.js:
--   const bcrypt = require('bcrypt');
--   bcrypt.hash('tu_password', 10, (err, hash) => console.log(hash));

INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@c3nicaragua.com',
 '$2b$10$rBV2JDeWW3.vKyeQcM8fFOz7bVd1QZ1wPbWqGTLHz5C5KQRKWj9Oa',
 'Agente de Ventas C3',
 'admin')
ON CONFLICT (username) DO NOTHING;
```

> ⚠️ **Para generar tu propio hash bcrypt real**, ejecuta en una terminal de Node.js:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('c3nicaragua2026', 10, (e,h) => console.log(h))"
```

Copia el hash resultante y reemplaza el valor de arriba.

### Paso 6.6: Verificar los datos insertados

```sql
-- Contar registros por tabla
SELECT
    'brands' as tabla, COUNT(*) as registros FROM brands
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'site_config', COUNT(*) FROM site_config;

-- Ver los primeros 5 productos
SELECT code, name, price_public, price_distributor, stock
FROM products
LIMIT 5;
```

**Resultado esperado:**

| tabla | registros |
|---|---|
| brands | 7 |
| categories | 7 |
| products | 21 |
| users | 1 |
| site_config | 6 |

---

## 👤 7. Crear usuario de aplicación

> 🔐 **Buena práctica**: El usuario `c3_admin` es solo para tareas administrativas. Para el backend de la aplicación, crea un usuario con permisos limitados.

### Paso 7.1: Crear el rol y usuario de aplicación

```sql
-- Conectado como c3_admin a la base de datos c3_nicaragua

-- Crear el rol de aplicación
CREATE ROLE c3_app_user WITH LOGIN PASSWORD 'C3App2026!SecurePwd';

-- Otorgar permisos de conexión
GRANT CONNECT ON DATABASE c3_nicaragua TO c3_app_user;

-- Otorgar uso del esquema
GRANT USAGE ON SCHEMA public TO c3_app_user;

-- Otorgar permisos en las tablas (CRUD)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO c3_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO c3_app_user;

-- Para que los permisos se apliquen a tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO c3_app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO c3_app_user;
```

### Paso 7.2: Verificar el usuario

```bash
# Probar conexión con el nuevo usuario
psql \
  -h c3-nicaragua-db.xxxxx.us-east-1.rds.amazonaws.com \
  -p 5432 \
  -U c3_app_user \
  -d c3_nicaragua
```

Debería poder hacer SELECT pero NO DROP ni CREATE.

---

## 💾 8. Configurar backups automáticos

Amazon RDS hace backups automáticos por defecto, pero aquí está cómo configurarlos a fondo.

### Paso 8.1: Verificar backup automático
1. Ve a **RDS > Bases de datos > tu-instancia**.
2. Click en la pestaña **"Mantenimiento y backups"**.
3. Verás la **"Ventana de backup"** y **"Retención"**.

### Paso 8.2: Configurar retención
1. Click en **"Modificar"**.
2. En **"Respaldo"**:
   - **Período de retención de backup automatizado**: `7 días` (mínimo) hasta `35 días` (máximo)
3. En **"Ventana de backup"**: elige una hora de baja actividad (ej: `03:00 - 04:00`).
4. Click en **"Continuar"** → **"Aplicar inmediatamente"** o en la siguiente ventana de mantenimiento.

### Paso 8.3: Crear backup manual (snapshot)
1. Ve a **RDS > Bases de datos > tu-instancia**.
2. Click en **"Acciones" > "Tomar instantánea"**.
3. Dale un nombre identificable: `c3-nicaragua-manual-2026-01-15`.
4. Click en **"Tomar instantánea"**.

### Paso 8.4: Restaurar desde snapshot
1. Ve a **RDS > Snapshots > Snapshots manuales**.
2. Selecciona el snapshot.
3. Click en **"Acciones" > "Restaurar desde instantánea"**.
4. Configura los parámetros de la nueva instancia.
5. Click en **"Restaurar"**.

> ⚠️ **Importante**: Restaurar crea una NUEVA instancia, no reemplaza la actual. Apunta tu aplicación a la nueva.

---

## 🔌 9. Conectar el backend a RDS

### Paso 9.1: Variables de entorno del backend

Crea un archivo `.env` en tu proyecto de backend:

```bash
# ====== Database (RDS) ======
DB_HOST=c3-nicaragua-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=c3_nicaragua
DB_USER=c3_app_user
DB_PASSWORD=C3App2026!SecurePwd
DB_SSL=true

# ====== App ======
NODE_ENV=production
PORT=3001
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui_cambiame_en_produccion
```

### Paso 9.2: Ejemplo de conexión en Node.js

```javascript
// db.js
import { Pool } from 'pg';
import 'dotenv/config';

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,                // máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test de conexión
pool.on('connect', () => console.log('✅ Conectado a RDS PostgreSQL'));
pool.on('error', (err) => console.error('❌ Error en la conexión:', err));

// Helper para queries
export const query = (text, params) => pool.query(text, params);
```

### Paso 9.3: Ejemplo de query — listar productos

```javascript
// products.service.js
import { query } from './db.js';

export async function listProducts({ brand, category, search, limit = 50, offset = 0 } = {}) {
    let sql = `
        SELECT p.*, b.name as brand_name, c.name as category_name
        FROM products p
        JOIN brands b ON p.brand_id = b.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = TRUE
    `;
    const params = [];
    let i = 1;

    if (brand) { sql += ` AND b.slug = $${i++}`; params.push(brand); }
    if (category) { sql += ` AND c.slug = $${i++}`; params.push(category); }
    if (search) { sql += ` AND p.name ILIKE $${i++}`; params.push(`%${search}%`); }

    sql += ` ORDER BY p.is_featured DESC, p.created_at DESC LIMIT $${i++} OFFSET $${i++}`;
    params.push(limit, offset);

    const { rows } = await query(sql, params);
    return rows;
}
```

### Paso 9.4: Ejemplo de query — crear cotización

```javascript
// quotations.service.js
import { query } from './db.js';

export async function createQuotation(data) {
    const { customerName, customerPhone, customerEmail, customerNote, items, priceType } = data;
    const id = `COT-${Date.now().toString(36).toUpperCase()}`;

    // Calcular totales
    let total = 0;
    const enrichedItems = items.map(item => {
        const lineTotal = item.unitPrice * item.quantity;
        total += lineTotal;
        return { ...item, lineTotal };
    });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insertar cotización
        await client.query(
            `INSERT INTO quotations (id, customer_name, customer_phone, customer_email, customer_note, total, price_type, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'nueva')`,
            [id, customerName, customerPhone, customerEmail, customerNote, total, priceType]
        );

        // Insertar items
        for (const item of enrichedItems) {
            await client.query(
                `INSERT INTO quotation_items (quotation_id, product_id, product_code, product_name, brand_name, color, quantity, unit_price, line_total)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [id, item.productId, item.productCode, item.productName, item.brandName, item.color, item.quantity, item.unitPrice, item.lineTotal]
            );
        }

        await client.query('COMMIT');
        return { id, total };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}
```

---

## 📊 10. Monitoreo y mantenimiento

### Paso 10.1: CloudWatch (ya viene incluido)
1. Ve a **CloudWatch > Metrics > RDS**.
2. Métricas clave a monitorear:
   - **CPUUtilization**: no debe pasar del 80% sostenido
   - **FreeableMemory**: debe estar por encima de 200 MB
   - **DatabaseConnections**: según tu plan
   - **ReadLatency / WriteLatency**: menor a 10 ms
   - **DiskQueueDepth**: debe ser 0 o cercano

### Paso 10.2: Configurar alarmas
1. Ve a **CloudWatch > Alarmas > Crear alarma**.
2. Métrica: `RDS > CPUUtilization`.
3. Umbral: `> 80%` durante 5 minutos.
4. Acción: notificar por SNS (email o SMS).

### Paso 10.3: Habilitar Performance Insights
1. Ve a **RDS > Bases de datos > tu-instancia > Modificar**.
2. En **"Performance Insights"**: ✅ Habilitar.
3. **Retención**: `7 días` (gratis) o más (con costo).

### Paso 10.4: Configurar mantenimiento automático
1. Ve a **RDS > Bases de datos > tu-instancia > Modificar**.
2. En **"Mantenimiento"**:
   - **Versión secundaria auto upgrade**: ✅ Habilitar (parches de seguridad)
   - **Ventana de mantenimiento**: Domingos 03:00-04:00 AM

### Paso 10.5: Limpieza periódica (consultas útiles)

```sql
-- Ver cotizaciones de los últimos 30 días
SELECT id, customer_name, total, status, created_at
FROM quotations
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Top 10 productos más cotizados
SELECT
    p.name,
    p.code,
    SUM(qi.quantity) as total_cotizado
FROM quotation_items qi
JOIN products p ON qi.product_id = p.id
GROUP BY p.id, p.name, p.code
ORDER BY total_cotizado DESC
LIMIT 10;

-- Total de ventas cerradas por mes
SELECT
    DATE_TRUNC('month', closed_at) as mes,
    COUNT(*) as cotizaciones,
    SUM(total) as total_vendido
FROM quotations
WHERE status = 'cerrada' AND closed_at IS NOT NULL
GROUP BY mes
ORDER BY mes DESC;
```

---

## 💰 Costos estimados

| Componente | Free Tier (12 meses) | Producción básica |
|---|---|---|
| **Instancia db.t3.micro** | Gratis (750h/mes) | — |
| **Instancia db.t3.small** | — | ~$30 USD/mes |
| **Almacenamiento gp2/gp3** | 20 GB gratis | $0.115/GB-mes |
| **Backup retenido** | = tamaño DB gratis | $0.095/GB-mes |
| **Transferencia de datos** | 100 GB gratis/mes | $0.09/GB saliente |
| **Performance Insights** | 7 días gratis | $7/mes (ret. larga) |

### Tips para ahorrar:

- ✅ Usa **Reserved Instances** si sabes que lo usarás por 1-3 años (hasta 60% descuento).
- ✅ Apaga instancias de desarrollo en horarios no laborales.
- ✅ Usa **gp3** en lugar de gp2 (más barato y más rápido).
- ✅ Elimina snapshots manuales antiguos.
- ✅ Configura el ciclo de vida de backups a 7 días máximo.

---

## ✅ Checklist final

- [ ] Cuenta de AWS creada y verificada
- [ ] Instancia RDS PostgreSQL creada y disponible
- [ ] Security Group configurado (solo IPs de confianza)
- [ ] Conexión probada desde DBeaver/pgAdmin/psql
- [ ] Base de datos `c3_nicaragua` creada
- [ ] 8 tablas creadas: `brands`, `categories`, `products`, `users`, `quotations`, `quotation_items`, `site_config`, `audit_log`
- [ ] Datos seed insertados: 7 marcas, 7 categorías, 21 productos, 1 usuario admin
- [ ] Usuario de aplicación `c3_app_user` creado
- [ ] Backups automáticos configurados (mínimo 7 días)
- [ ] Performance Insights habilitado
- [ ] Alarmas de CloudWatch configuradas
- [ ] Backend conectado a RDS y funcionando

---

## 🆘 Solución de problemas comunes

### ❌ "Connection timed out"
- Verifica que el Security Group permita tráfico en el puerto 5432 desde tu IP.
- Verifica que la instancia tenga **"Acceso público = Sí"** (si te conectas desde fuera de AWS).

### ❌ "password authentication failed"
- Verifica que estás usando la contraseña correcta (sin caracteres especiales mal escapados).
- Asegúrate de usar el usuario `c3_admin` (no `postgres` o `admin`).

### ❌ "database does not exist"
- Verifica que creaste la base `c3_nicaragua`.
- Conéctate primero a `postgres` y luego cambia a `c3_nicaragua`.

### ❌ "permission denied for table"
- El usuario `c3_app_user` no tiene permisos. Ejecuta los GRANTs del Paso 7.1.

### ❌ RDS está muy lento
- Revisa CloudWatch → CPU y memoria.
- Considera escalar a `db.t3.small` o superior.
- Activa Performance Insights para ver queries lentas.

---

## 📞 Contacto AWS Support

Si tienes problemas con la configuración de AWS:
- **Consola**: [https://console.aws.amazon.com/support/](https://console.aws.amazon.com/support/)
- **Documentación RDS**: [https://docs.aws.amazon.com/rds/](https://docs.aws.amazon.com/rds/)
- **Foro RDS**: [https://repost.aws/tags/TAxJGBUaqRhdQ2Rr3VF6L-pA/rds](https://repost.aws/tags/TAxJGBUaqRhdQ2Rr3VF6L-pA/rds)

---

**¡Listo! Tu base de datos C3 Nicaragua está en producción en Amazon RDS. 🎉**
