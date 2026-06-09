# 🗄️ Implementación de Base de Datos

## C3 Nicaragua - Catálogo con Cotización WhatsApp

---

## 📐 Modelo de Datos

El sistema utiliza **5 entidades principales**. A continuación se presenta el esquema SQL completo para **PostgreSQL** (recomendado), junto con el código SQL, los DDLs, los índices y un script de seed con datos de ejemplo.

### Diagrama Relacional (ER)

```
┌──────────────┐        ┌─────────────────┐        ┌──────────────┐
│  categories  │◄───────│    products     │───────►│   brands     │
└──────────────┘        └─────────────────┘        └──────────────┘
                              │    ▲
                              │    │
                              ▼    │
┌──────────────┐        ┌─────────────────┐
│  quotations  │───────►│  quotation_items│
└──────────────┘        └─────────────────┘
        │
        ▼
┌──────────────┐
│    users     │  (admin/agentes)
└──────────────┘
```

---

## 🐘 Script SQL Completo (PostgreSQL 14+)

```sql
-- =====================================================
-- C3 NICARAGUA - DATABASE SCHEMA
-- PostgreSQL 14+
-- =====================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABLA: brands
-- =====================================================
CREATE TABLE brands (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    slug        VARCHAR(50) UNIQUE NOT NULL,
    color_hex   VARCHAR(7) NOT NULL,           -- color de marca
    logo_text   VARCHAR(50) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);

-- =====================================================
-- 2. TABLA: categories
-- =====================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(80) UNIQUE NOT NULL,
    slug        VARCHAR(80) UNIQUE NOT NULL,
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INT DEFAULT 0
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- =====================================================
-- 3. TABLA: products
-- =====================================================
CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(50) UNIQUE NOT NULL,
    name                VARCHAR(200) NOT NULL,
    brand_id            INT NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    category_id         INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    capacity            VARCHAR(20),                    -- ej: "30 oz"
    price_public        NUMERIC(10,2) NOT NULL CHECK (price_public >= 0),
    price_distributor   NUMERIC(10,2) NOT NULL CHECK (price_distributor >= 0),
    description         TEXT,
    features            JSONB DEFAULT '[]'::JSONB,      -- array de strings
    colors              JSONB DEFAULT '[]'::JSONB,      -- [{"name":"Negro","hex":"#1A1A1A"}]
    stock               INT DEFAULT 0 CHECK (stock >= 0),
    is_featured         BOOLEAN DEFAULT FALSE,
    is_new              BOOLEAN DEFAULT FALSE,
    packaging           VARCHAR(200),
    image_url           TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    is_active           BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_search ON products USING GIN (
    to_tsvector('spanish', name || ' ' || code || ' ' || capacity)
);

-- Trigger para updated_at
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

-- =====================================================
-- 4. TABLA: users (admin / agentes de ventas)
-- =====================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(150) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,             -- bcrypt
    full_name       VARCHAR(200) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agente', 'supervisor')),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);

-- =====================================================
-- 5. TABLA: quotations
-- =====================================================
CREATE TYPE quotation_status AS ENUM ('nueva', 'contactado', 'cerrada', 'cancelada');

CREATE TABLE quotations (
    id              VARCHAR(50) PRIMARY KEY,            -- ej: COT-LXK2K9
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
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    contacted_at    TIMESTAMPTZ,
    closed_at       TIMESTAMPTZ
);

CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created ON quotations(created_at DESC);
CREATE INDEX idx_quotations_phone ON quotations(customer_phone);
CREATE INDEX idx_quotations_assigned ON quotations(assigned_to);

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON quotations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. TABLA: quotation_items
-- =====================================================
CREATE TABLE quotation_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id    VARCHAR(50) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_code    VARCHAR(50) NOT NULL,              -- snapshot
    product_name    VARCHAR(200) NOT NULL,             -- snapshot
    brand_name      VARCHAR(50) NOT NULL,              -- snapshot
    color           VARCHAR(100) NOT NULL,
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2) NOT NULL,
    line_total      NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_product ON quotation_items(product_id);

-- =====================================================
-- 7. TABLA: site_config (key-value)
-- =====================================================
CREATE TABLE site_config (
    key             VARCHAR(100) PRIMARY KEY,
    value           JSONB NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_by      UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 8. TABLA: audit_log
-- =====================================================
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,              -- CREATE, UPDATE, DELETE, LOGIN
    entity_type     VARCHAR(50) NOT NULL,              -- product, quotation, etc.
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
```

---

## 🌱 Seed de Datos (Datos Iniciales)

```sql
-- =====================================================
-- SEED DATA
-- =====================================================

-- Marcas
INSERT INTO brands (name, slug, color_hex, logo_text) VALUES
('Stanley',   'stanley',   '#1B1B1B', 'STANLEY'),
('YETI',      'yeti',      '#0F4C81', 'YETI'),
('Owala',     'owala',     '#9333EA', 'owala'),
('Lululemon', 'lululemon', '#C9082A', 'lululemon'),
('Thermos',   'thermos',   '#DC2626', 'THERMOS'),
('Disney',    'disney',    '#1E40AF', 'Disney'),
('Genéricos', 'genericos', '#0A1B2A', 'GENÉRICOS');

-- Categorías
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Todos los vasos',  'todos',          'Todos los productos',           0),
('Con tapa y popote','tapa-popote',    'Vasos con popote integrado',    1),
('Con asa',          'con-asa',        'Vasos con asa de transporte',   2),
('Botellas',         'botellas',       'Botellas térmicas clásicas',    3),
('Kids / Disney',    'kids-disney',    'Productos para niños y Disney', 4),
('Genéricos',        'genericos',      'Línea genérica para sublimar',  5),
('Accesorios',       'accesorios',     'Popotes, tapas y más',          6);

-- Usuario admin por defecto
-- password: c3nicaragua2026 (bcrypt hash)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@c3nicaragua.com',
 '$2b$10$YourBcryptHashHere',
 'Agente de Ventas C3',
 'admin');

-- Configuración inicial del sitio
INSERT INTO site_config (key, value) VALUES
('whatsapp_number',   '"+50588888888"'::jsonb),
('sales_email',       '"ventas@c3nicaragua.com"'::jsonb),
('company_name',      '"C3 Nicaragua"'::jsonb),
('address',           '"Managua, Nicaragua"'::jsonb),
('min_distributor_qty','5'::jsonb),
('shipping_zones',    '[
  {"department":"Managua","time":"24-48 horas","cost":80},
  {"department":"León, Granada, Masaya","time":"48 horas","cost":120},
  {"department":"Estelí, Matagalpa, Jinotega","time":"48-72 horas","cost":150},
  {"department":"Caribe","time":"72 horas","cost":200}
]'::jsonb);

-- Productos de ejemplo
INSERT INTO products (code, name, brand_id, category_id, capacity, price_public, price_distributor, colors, features, stock, is_featured, packaging)
VALUES
('ST-QUENCH-40', 'Stanley Quencher H2.0', 1, 2, '40 oz', 1450, 870,
  '[{"name":"Blanco Crema","hex":"#F5F1E8"},{"name":"Negro Mate","hex":"#1A1A1A"}]'::jsonb,
  '["Aislamiento al vacío de doble pared","Tapa FlowState™ 3 posiciones","Acero 18/8"]'::jsonb,
  35, TRUE, 'Caja individual con sticker oficial'),
('YT-RAMBLER-30', 'YETI Rambler', 2, 2, '30 oz', 1300, 780,
  '[{"name":"Negro","hex":"#1A1A1A"},{"name":"Blanco","hex":"#FFFFFF"}]'::jsonb,
  '["Aislamiento al vacío","Acero 18/8","Acabado DuraCoat™"]'::jsonb,
  30, TRUE, 'Caja YETI oficial'),
('OW-FREESIP-32', 'Owala FreeSip', 3, 1, '32 oz', 1250, 780,
  '[{"name":"Lila Sueño","hex":"#C8A2C8"},{"name":"Verde Menta","hex":"#98D8C8"}]'::jsonb,
  '["Boquilla FreeSip patentada","Aislamiento triple","Popote oculto"]'::jsonb,
  38, TRUE, 'Caja Owala oficial');
```

---

## 🔌 API REST (Backend Node.js + Express)

Ejemplo de endpoints para producción:

```javascript
// =====================================================
// API ENDPOINTS - Node.js + Express
// =====================================================

// PRODUCTOS
GET    /api/products              // Listar (con ?marca=, ?categoria=, ?q=)
GET    /api/products/:id          // Detalle
POST   /api/products              // Crear (admin)
PUT    /api/products/:id          // Editar (admin)
DELETE /api/products/:id          // Eliminar (admin)

// MARCAS Y CATEGORÍAS
GET    /api/brands
GET    /api/categories

// COTIZACIONES
POST   /api/quotations            // Cliente crea (público)
GET    /api/quotations            // Listar (admin, con filtros)
GET    /api/quotations/:id        // Detalle
PATCH  /api/quotations/:id        // Cambiar estado (admin)
DELETE /api/quotations/:id        // Eliminar (admin)

// AUTENTICACIÓN
POST   /api/auth/login            // { username, password } -> { token, user }
POST   /api/auth/logout
GET    /api/auth/me               // Usuario actual

// CONFIGURACIÓN
GET    /api/config                // Pública
PUT    /api/config                // Admin

// ESTADÍSTICAS (admin)
GET    /api/stats/dashboard       // Métricas del dashboard
```

### Middleware de Autenticación (JWT)

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No autorizado' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

const adminOnly = (req, res, next) => {
    if (!['admin', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
};
```

---

## 🔒 Seguridad y Buenas Prácticas

1. **Contraseñas**: Siempre hasheadas con **bcrypt** (cost 10+)
2. **Tokens JWT**: expiración de 24h, refresh tokens de 7 días
3. **HTTPS obligatorio** en producción
4. **Rate limiting** en endpoints de login y cotizaciones (10 req/min)
5. **Validación de entrada** con Zod / Joi
6. **Sanitización** contra SQL injection (usar parameterized queries)
7. **CORS** configurado para el dominio del frontend
8. **Backups automáticos** diarios de la base de datos
9. **Audit log** de todas las acciones administrativas

---

## 📊 Migraciones y Versionado

Se recomienda usar **Prisma**, **Drizzle ORM** o **Knex.js** para gestionar migraciones:

```bash
# Ejemplo con Prisma
npx prisma migrate dev --name init
npx prisma migrate deploy    # en producción
npx prisma db seed           # datos iniciales
```

---

## 🌍 Hosting Recomendado

- **Base de datos**: Neon.tech, Supabase, Railway, AWS RDS
- **Backend**: Railway, Render, Fly.io, AWS ECS
- **Frontend**: Vercel, Netlify, Cloudflare Pages
