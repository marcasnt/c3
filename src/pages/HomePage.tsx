import { Link } from 'react-router-dom';
import { useMemo, useRef } from 'react';
import { ArrowRight, ShieldCheck, CreditCard, Percent, MessageCircle, Star, Truck, Award, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { useApp } from '../store';
import { BRAND_INFO } from '../data/products';
import type { Brand } from '../types';

export function HomePage() {
  const { products } = useApp();
  const featured = products.filter(p => p.featured && p.isActive !== false).slice(0, 8);
  const newProducts = products.filter(p => p.isNew && p.isActive !== false).slice(0, 12);
  const brands = Object.keys(BRAND_INFO) as Brand[];

  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Prioritize featured products, fill with active products to get exactly 8 grid items
  const heroProducts = useMemo(() => {
    const list = products.filter(p => p.featured && p.isActive !== false);
    if (list.length < 8) {
      const remaining = products.filter(p => !p.featured && p.isActive !== false);
      list.push(...remaining);
    }
    return list.slice(0, 8);
  }, [products]);

  // Pair each hero product with a random color once on load
  const heroCardsData = useMemo(() => {
    return heroProducts.map(p => {
      const colors = p.colors || [];
      const randomColor = colors.length > 0
        ? colors[Math.floor(Math.random() * colors.length)]
        : null;
      return {
        product: p,
        randomColor
      };
    });
  }, [heroProducts]);

  return (
    <div className="fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0E5BA8] via-[#0E5BA8] to-[#1E3A8A] dark:from-[#0A2540] dark:via-[#0E2A5B] dark:to-[#0F1B40] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#00BFA6] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#7C3AED] blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 grid md:grid-cols-2 gap-8 items-center relative">
          <div>
            <span className="inline-block bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold mb-4">
              ✨ Catálogo mayorista 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              CALIDAD QUE<br />
              SE VE. <span className="text-[#00BFA6]">PRECIO</span> QUE<br />
              TE CONVIENE.
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-2 max-w-md">
              Vasos térmicos de las mejores marcas para tu estilo de vida.
            </p>
            <p className="text-white/80 text-sm mb-6 font-semibold">
              ¡Precios exclusivos para distribuidores!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Ver catálogo <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/50588888888"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 transition"
              >
                <MessageCircle className="w-4 h-4" /> Contactar
              </a>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-4 gap-2.5">
            {heroCardsData.map(({ product: p, randomColor }) => (
              <Link
                key={p.id}
                to={randomColor 
                  ? `/producto/${p.id}?color=${encodeURIComponent(randomColor.name)}`
                  : `/producto/${p.id}`
                }
                className="group bg-white/10 backdrop-blur rounded-xl p-2 flex flex-col gap-2 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border border-white/15 text-center"
              >
                <div className="w-full h-28 bg-white/5 dark:bg-black/20 rounded-lg flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-105">
                  <ProductImage 
                    product={p} 
                    size="full" 
                    imageUrlOverride={randomColor?.imageUrl}
                    colorHexOverride={randomColor?.hex}
                  />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-[9px] font-bold text-[#00BFA6] truncate uppercase tracking-wider leading-none">{p.brand}</p>
                  <p className="text-[11px] text-white font-semibold truncate leading-tight mt-1">{p.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-[#0A1B2A]/80 dark:bg-black/60 backdrop-blur border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Percent, title: 'PRECIOS DE DISTRIBUIDOR', desc: 'Más margen para tu negocio' },
              { icon: Award, title: 'PRODUCTOS ORIGINALES', desc: 'Las mejores marcas' },
              { icon: Truck, title: 'ENVÍOS A TODO NICARAGUA', desc: 'Rápido y seguro' },
              { icon: MessageCircle, title: 'ATENCIÓN PERSONALIZADA', desc: 'Estamos para ayudarte' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00BFA6]/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#00BFA6]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-white/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="py-10 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-[#0A1B2A] dark:text-slate-100">MARCAS DESTACADAS</h2>
            <Link to="/marcas" className="text-sm text-[#2563EB] font-medium hover:underline inline-flex items-center gap-1">
              Ver todas las marcas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {brands.map(brand => (
              <Link
                key={brand}
                to={`/catalogo?marca=${brand}`}
                className="group bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-[#2563EB] rounded-xl p-4 flex items-center justify-center h-20 transition"
              >
                <span
                  className="text-sm md:text-base font-extrabold group-hover:scale-110 transition-transform"
                  style={{ color: BRAND_INFO[brand].color, fontFamily: 'Poppins, sans-serif' }}
                >
                  {BRAND_INFO[brand].logo}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOG GRID */}
      <section className="py-10 bg-gray-50 dark:bg-slate-800/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#0A1B2A] dark:text-slate-200" />
              <h2 className="text-base font-bold text-[#0A1B2A] dark:text-slate-100">CATÁLOGO DE PRODUCTOS</h2>
            </div>
            <Link to="/catalogo" className="text-sm text-[#0A1B2A] dark:text-slate-200 font-semibold hover:text-[#2563EB] inline-flex items-center gap-1">
              Ver todos los productos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* DISTRIBUTOR BANNER + DELIVERY */}
      <section className="py-10 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gradient-to-r from-[#00BFA6] to-[#2563EB] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/5" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">¿ERES DISTRIBUIDOR?</h3>
              <p className="text-white/90 mb-5 max-w-md">
                Regístrate y accede a precios exclusivos, novedades y más beneficios para tu negocio.
              </p>
              <a
                href="https://wa.me/50588888888?text=Hola%2C%20quiero%20ser%20distribuidor%20C3"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#0A1B2A] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition"
              >
                Registrarme gratis <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0A1B2A] to-[#0E5BA8] dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
            <Truck className="w-12 h-12 mb-3 text-[#00BFA6]" />
            <h3 className="font-extrabold text-lg mb-1">ENVÍOS A TODO NICARAGUA</h3>
            <p className="text-white/80 text-sm mb-3">Recibe tus productos en la puerta de tu negocio.</p>
            <Link to="/envios" className="text-[#00BFA6] text-sm font-semibold hover:underline inline-flex items-center gap-1">
              Más información <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newProducts.length > 0 && (
        <section className="py-10 bg-gray-50 dark:bg-slate-800/30 transition-colors relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#00BFA6]" />
                <h2 className="text-base font-bold text-[#0A1B2A] dark:text-slate-100">NOVEDADES</h2>
              </div>
              {newProducts.length > 4 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => scroll('left')}
                    className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full hover:border-[#2563EB]/50 transition shadow-sm cursor-pointer"
                    aria-label="Deslizar izquierda"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-slate-200" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full hover:border-[#2563EB]/50 transition shadow-sm cursor-pointer"
                    aria-label="Deslizar derecha"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700 dark:text-slate-200" />
                  </button>
                </div>
              )}
            </div>

            <div 
              ref={carouselRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 no-scrollbar pb-4"
            >
              {newProducts.map(p => (
                <div 
                  key={p.id} 
                  className="w-[calc(50%-8px)] md:w-[calc(25%-12px)] shrink-0 snap-start"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST BOTTOM */}
      <section className="py-10 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: 'COMPRA 100% SEGURA', desc: 'Protegemos tu información' },
            { icon: CreditCard, title: 'PAGOS FLEXIBLES', desc: 'Múltiples métodos de pago' },
            { icon: Percent, title: 'DESCUENTOS POR VOLUMEN', desc: 'Más compras, más beneficios' },
            { icon: MessageCircle, title: 'ATENCIÓN RÁPIDA', desc: 'WhatsApp y soporte directo' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <p className="font-bold text-xs text-[#0A1B2A] dark:text-slate-100">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
