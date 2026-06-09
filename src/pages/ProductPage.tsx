import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Heart, ShoppingCart, MessageCircle, Shield, Truck, Percent, ChevronLeft, Check, Tag } from 'lucide-react';
import { useApp } from '../store';
import { ProductImage } from '../components/ProductImage';
import { ProductCard } from '../components/ProductCard';
import { BRAND_INFO } from '../data/products';
import { cn } from '../utils/cn';

export function ProductPage() {
  const { id } = useParams();
  const { products, addToCart, setCartOpen, siteConfig } = useApp();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);

  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [fav, setFav] = useState(false);

  // Auto-calc: distributor when qty >= min
  const priceType: 'public' | 'distributor' = quantity >= siteConfig.minDistributorQty ? 'distributor' : 'public';
  const unitPrice = priceType === 'distributor' ? product?.priceDistributor || 0 : product?.pricePublic || 0;
  const total = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold dark:text-slate-100">Producto no encontrado</h2>
        <Link to="/catalogo" className="text-[#2563EB] hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  const brandInfo = BRAND_INFO[product.brand];
  const savings = product.pricePublic - product.priceDistributor;
  const related = products.filter(p => p.brand === product.brand && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(product, product.colors[selectedColor].name, quantity, priceType);
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, product.colors[selectedColor].name, quantity, priceType);
    navigate('/checkout');
  };

  return (
    <div className="fade-in max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-gray-500 dark:text-slate-400 mb-4">
        <Link to="/" className="hover:text-[#2563EB]">Inicio</Link> <span className="mx-1">›</span>
        <Link to="/catalogo" className="hover:text-[#2563EB]">Catálogo</Link> <span className="mx-1">›</span>
        <Link to={`/catalogo?marca=${product.brand}`} className="hover:text-[#2563EB]">{product.brand}</Link> <span className="mx-1">›</span>
        <span className="text-[#0A1B2A] dark:text-slate-200 font-medium">{product.name}</span>
      </nav>

      <Link to="/catalogo" className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400 hover:text-[#2563EB] mb-4">
        <ChevronLeft className="w-4 h-4" /> Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div>
          <div className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 aspect-square flex items-center justify-center">
            <ProductImage product={product} size="xl" />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="aspect-square border border-gray-200 dark:border-slate-700 rounded-lg bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center cursor-pointer hover:border-[#2563EB] p-1">
                <ProductImage product={product} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded"
              style={{ backgroundColor: `${brandInfo.color}15`, color: brandInfo.color }}
            >
              {product.brand}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400">Código: {product.code}</span>
            {product.isNew && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#00BFA6] text-white">NUEVO</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A1B2A] dark:text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {product.name} {product.capacity}
          </h1>

          {/* Price - AUTO CALCULATED */}
          <div className="mt-5 p-4 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase">Precio público</p>
                <p className={cn('text-2xl font-extrabold', priceType === 'public' ? 'text-[#0A1B2A] dark:text-slate-100' : 'text-gray-400 dark:text-slate-500 line-through')}>
                  C$ {product.pricePublic.toLocaleString('es-NI')}
                </p>
              </div>
              {savings > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold uppercase">Distribuidor</p>
                  <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    C$ {product.priceDistributor.toLocaleString('es-NI')}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              {priceType === 'distributor' ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 flex items-start gap-2">
                  <Tag className="w-4 h-4 text-emerald-700 dark:text-emerald-300 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-800 dark:text-emerald-200">Precio distribuidor aplicado</p>
                    <p className="text-emerald-700 dark:text-emerald-300">
                      Tienes {quantity} unidades (≥ {siteConfig.minDistributorQty}). Se calcula automáticamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    ℹ️ Tienes {quantity} {quantity === 1 ? 'unidad' : 'unidades'}. Precio público. Distribuidor aplica con {siteConfig.minDistributorQty}+.
                  </p>
                  <div className="mt-1.5 h-1.5 bg-blue-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#00BFA6] transition-all"
                      style={{ width: `${Math.min(100, (quantity / siteConfig.minDistributorQty) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Colors */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#0A1B2A] dark:text-slate-100">
                Color: <span className="font-normal text-gray-600 dark:text-slate-400">{product.colors[selectedColor].name}</span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(i)}
                  title={c.name}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 transition flex items-center justify-center',
                    selectedColor === i ? 'border-[#2563EB] scale-110 ring-2 ring-[#2563EB]/30' : 'border-gray-200 dark:border-slate-600 hover:border-gray-400'
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {selectedColor === i && (
                    <Check className={cn('w-4 h-4', isLightColor(c.hex) ? 'text-gray-800' : 'text-white')} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-[#0A1B2A] dark:text-slate-100 mb-2">Cantidad</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                >−</button>
                <span className="px-4 font-semibold dark:text-slate-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                >+</button>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Stock: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{product.stock} disponibles</span>
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
            >
              <ShoppingCart className="w-4 h-4" /> Agregar al carrito
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white font-semibold py-3 rounded-lg transition"
            >
              <MessageCircle className="w-4 h-4" /> Cotizar ahora
            </button>
            <button
              onClick={() => setFav(v => !v)}
              className="px-4 border-2 border-gray-200 dark:border-slate-600 hover:border-red-300 rounded-lg"
              aria-label="Favorito"
            >
              <Heart className={cn('w-5 h-5', fav ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-slate-500')} />
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Total: <span className="font-bold text-[#0A1B2A] dark:text-slate-100">C$ {total.toLocaleString('es-NI')}</span>
            <span className="ml-2 text-[10px]">
              ({priceType === 'distributor' ? '✅ Precio distribuidor' : 'ℹ️ Precio público'})
            </span>
          </p>

          {/* Features */}
          <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-5">
            <h3 className="font-bold text-sm mb-2 dark:text-slate-100">Características</h3>
            <ul className="space-y-1.5">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-slate-300">{product.description}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
              <span className="font-semibold">Embalaje:</span> {product.packaging}
            </p>
          </div>

          {/* Trust */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: Shield, label: 'Pago seguro' },
              { icon: Truck, label: 'Envío nacional' },
              { icon: Percent, label: 'Precio distribuidor' },
            ].map((it, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-center">
                <it.icon className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[10px] font-medium text-gray-700 dark:text-slate-300">{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
            También te puede interesar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160;
}
