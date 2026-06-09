import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../store';
import { BRAND_INFO } from '../data/products';
import type { Brand, Category } from '../types';
import { cn } from '../utils/cn';

const CATEGORIES: (Category | 'Todos')[] = [
  'Todos', 'Con tapa y popote', 'Con asa', 'Botellas', 'Kids / Disney', 'Genéricos', 'Accesorios',
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
];

export function CatalogPage() {
  const { products } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [brand, setBrand] = useState<Brand | 'Todas'>(
    (searchParams.get('marca') as Brand) || 'Todas'
  );
  const [category, setCategory] = useState<Category | 'Todos'>(
    (searchParams.get('cat') as Category) || 'Todos'
  );
  const [sort, setSort] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (brand !== 'Todas') params.marca = brand;
    if (category !== 'Todos') params.cat = category;
    setSearchParams(params, { replace: true });
  }, [search, brand, category, setSearchParams]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.code.toLowerCase().includes(s) ||
        p.capacity.toLowerCase().includes(s)
      );
    }
    if (brand !== 'Todas') list = list.filter(p => p.brand === brand);
    if (category !== 'Todos') list = list.filter(p => p.category === category);

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.pricePublic - b.pricePublic);
        break;
      case 'price-desc':
        list.sort((a, b) => b.pricePublic - a.pricePublic);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    return list;
  }, [products, search, brand, category, sort]);

  const brands = Object.keys(BRAND_INFO) as Brand[];

  return (
    <div className="fade-in max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-gray-500 dark:text-slate-400 mb-3">
        <Link to="/">Inicio</Link> <span className="mx-1">›</span> <span className="text-[#0A1B2A] dark:text-slate-200 font-medium">Catálogo</span>
      </nav>

      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A1B2A] dark:text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Catálogo de Vasos Térmicos
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'} encontrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className={cn('space-y-5', showFilters ? 'block' : 'hidden md:block')}>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm dark:text-slate-100">Filtros</h3>
              <button
                onClick={() => { setBrand('Todas'); setCategory('Todos'); setSearch(''); }}
                className="text-xs text-[#2563EB] hover:underline"
              >
                Limpiar
              </button>
            </div>

            <div className="relative mb-4">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar en catálogo..."
                className="w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Categorías</h4>
              <ul className="space-y-1">
                {CATEGORIES.map(c => (
                  <li key={c}>
                    <button
                      onClick={() => setCategory(c)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-md text-sm transition',
                        category === c ? 'bg-[#2563EB] text-white font-medium' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'
                      )}
                    >
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">Marcas</h4>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setBrand('Todas')}
                    className={cn(
                      'w-full text-left px-3 py-1.5 rounded-md text-sm transition',
                      brand === 'Todas' ? 'bg-[#2563EB] text-white font-medium' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'
                    )}
                  >
                    Todas las marcas
                  </button>
                </li>
                {brands.map(b => (
                  <li key={b}>
                    <button
                      onClick={() => setBrand(b)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-md text-sm transition flex items-center gap-2',
                        brand === b ? 'bg-[#2563EB] text-white font-medium' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'
                      )}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_INFO[b].color }} />
                      {b}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-sm">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-1">💰 ¿Eres distribuidor?</h4>
            <p className="text-emerald-700 dark:text-emerald-300 text-xs mb-2">Aplica precio distribuidor en compras de 5+ unidades.</p>
            <a
              href="https://wa.me/50588888888"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 hover:underline"
            >
              Contactar ventas →
            </a>
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg dark:text-slate-100">No se encontraron productos</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Intenta ajustar los filtros o buscar otro término.</p>
              <button
                onClick={() => { setBrand('Todas'); setCategory('Todos'); setSearch(''); }}
                className="mt-4 px-4 py-2 bg-[#0A1B2A] dark:bg-slate-700 text-white rounded-lg text-sm"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
