import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { ProductImage } from './ProductImage';
import { BRAND_INFO } from '../data/products';
import { useApp } from '../store';
import { useState } from 'react';
import { cn } from '../utils/cn';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setCartOpen } = useApp();
  const [fav, setFav] = useState(false);
  const [selectedColor, setSelectedColor] = useState(() => {
    if (!product.colors || product.colors.length === 0) {
      return { name: 'Defecto', hex: '#1A1A1A' };
    }
    const visibleColors = product.colors.slice(0, 6);
    const randomIndex = Math.floor(Math.random() * visibleColors.length);
    return visibleColors[randomIndex];
  });

  const savings = product.pricePublic - product.priceDistributor;
  const savingsPct = Math.round((savings / product.pricePublic) * 100);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedColor.name, 1, 'public');
    setCartOpen(true);
  };

  return (
    <Link
      to={`/producto/${product.id}?color=${encodeURIComponent(selectedColor.name)}`}
      className="group block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#2563EB]/30 dark:hover:border-blue-500/50 transition-all"
    >
      <div className="relative bg-gradient-to-b from-gray-50 to-white dark:from-slate-700/40 dark:to-slate-800 p-4 aspect-square flex items-center justify-center">
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-[#00BFA6] text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
            NUEVO
          </span>
        )}
        {product.featured && !product.isNew && (
          <span className="absolute top-3 left-3 bg-[#2563EB] text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
            DESTACADO
          </span>
        )}
        <button
          onClick={e => { e.preventDefault(); setFav(v => !v); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow hover:shadow-md flex items-center justify-center z-10"
          aria-label="Favorito"
        >
          <Heart className={cn('w-4 h-4', fav ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-slate-400')} />
        </button>

        <div className="transform group-hover:scale-105 transition-transform w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
          <ProductImage
            product={product}
            size="full"
            imageUrlOverride={selectedColor.imageUrl}
            colorHexOverride={selectedColor.hex}
          />
        </div>

        <button
          onClick={handleQuickAdd}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-700 dark:hover:bg-slate-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
          aria-label="Agregar al carrito"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${BRAND_INFO[product.brand].color}15`, color: BRAND_INFO[product.brand].color }}
          >
            {product.brand}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-slate-400">{product.capacity}</span>
        </div>
        <h3 className="font-semibold text-sm text-[#0A1B2A] dark:text-slate-100 line-clamp-1 group-hover:text-[#2563EB] transition">
          {product.name}
        </h3>

        <div className="flex gap-1 mt-2">
          {product.colors.slice(0, 6).map(c => (
            <button
              key={c.name}
              onClick={e => { e.preventDefault(); setSelectedColor(c); }}
              title={c.name}
              className={cn(
                'w-4 h-4 rounded-full border-2 transition',
                selectedColor.name === c.name ? 'border-[#2563EB] scale-110' : 'border-gray-200 dark:border-slate-600'
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        <div className="mt-3 space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-gray-500 dark:text-slate-400">Público:</span>
            <span className="font-bold text-sm text-[#0A1B2A] dark:text-slate-100">
              C$ {product.pricePublic.toLocaleString('es-NI')}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 -mx-1 px-1 py-1 rounded">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Distribuidor:</span>
            <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
              C$ {product.priceDistributor.toLocaleString('es-NI')}
            </span>
            <span className="text-[9px] bg-emerald-600 dark:bg-emerald-700 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">
              -{savingsPct}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
