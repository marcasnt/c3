import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { useApp } from '../store';
import { BRAND_INFO } from '../data/products';
import type { Brand } from '../types';
import { ProductImage } from '../components/ProductImage';

export function BrandsPage() {
  const { products } = useApp();
  const brands = Object.keys(BRAND_INFO) as Brand[];

  const brandCards = useMemo(() => {
    return brands.map(brand => {
      const brandProducts = products.filter(p => p.brand === brand && p.isActive !== false);
      if (brandProducts.length === 0) return null;

      // Filter out accessories, keeping only thermos (termos)
      let thermosProducts = brandProducts.filter(p => p.category !== 'Accesorios');
      // If there are no thermos, fallback to brandProducts
      if (thermosProducts.length === 0) {
        thermosProducts = brandProducts;
      }

      // Collect all color variants from these thermos that have images
      const options = thermosProducts.flatMap(p => {
        const colors = p.colors || [];
        if (colors.length === 0) {
          return [{ product: p, color: null }];
        }
        return colors.map(c => ({ product: p, color: c }));
      }).filter(o => o.color?.imageUrl || o.product.imageUrl || o.product.image);

      // Select a random option
      const randomOption = options.length > 0
        ? options[Math.floor(Math.random() * options.length)]
        : { product: thermosProducts[0], color: null };

      return {
        brand,
        productsCount: brandProducts.length,
        option: randomOption
      };
    }).filter(Boolean) as {
      brand: Brand;
      productsCount: number;
      option: { product: any; color: any };
    }[];
  }, [products, brands]);

  return (
    <div className="fade-in max-w-7xl mx-auto px-4 py-8">
      <nav className="text-xs text-gray-500 dark:text-slate-400 mb-3">
        <Link to="/">Inicio</Link> <span className="mx-1">›</span> <span className="text-[#0A1B2A] dark:text-slate-200 font-medium">Marcas</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Nuestras Marcas
      </h1>
      <p className="text-gray-600 dark:text-slate-300 mb-8">Trabajamos con las marcas más reconocidas del mercado.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {brandCards.map(card => {
          const { brand, productsCount, option } = card;
          return (
            <Link
              key={brand}
              to={`/catalogo?marca=${brand}`}
              className="group bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-[#2563EB] rounded-2xl p-6 transition flex items-center gap-5"
            >
              <div className="w-24 h-32 bg-gradient-to-b from-gray-50 to-white dark:from-slate-700 dark:to-slate-900 rounded-lg flex items-center justify-center shrink-0 border border-gray-100 dark:border-slate-600 p-1">
                <ProductImage
                  product={option.product}
                  size="md"
                  imageUrlOverride={option.color?.imageUrl}
                  colorHexOverride={option.color?.hex}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_INFO[brand].color }} />
                  <h2 className="text-xl font-extrabold text-[#0A1B2A] dark:text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {brand}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 mb-2">
                  <Package className="w-3.5 h-3.5" />
                  <span>{productsCount} {productsCount === 1 ? 'producto' : 'productos'}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2 mb-3">
                  Descubre la línea completa de {brand}. Vasos térmicos de alta calidad con la garantía original de fábrica.
                </p>
                <span className="text-sm font-semibold text-[#2563EB] group-hover:underline inline-flex items-center gap-1">
                  Ver productos <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
