import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, MessageCircle, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';
import { useApp } from '../store';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../utils/cn';

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/marcas', label: 'Marcas' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/envios', label: 'Envíos' },
  { to: '/contacto', label: 'Contacto' },
];

export function Header() {
  const navigate = useNavigate();
  const { cartCount, setCartOpen, siteConfig } = useApp();
  const { theme, toggle } = useTheme();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(search)}`);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 transition-colors">
      <div className="brand-bar" />
      <div className="bg-[#0A1B2A] dark:bg-slate-950 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-[#00BFA6] transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Contáctanos: <strong>{siteConfig.whatsappNumber}</strong></span>
          </a>
          <span className="hidden md:block opacity-80">Envíos a todo Nicaragua · Precios exclusivos para distribuidores</span>
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 hover:text-[#00BFA6] transition"
            aria-label="Cambiar tema"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 lg:gap-8 h-20">
          <Link to="/" className="shrink-0">
            <Logo size="md" />
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar productos, marcas, modelos..."
                className="w-full pl-4 pr-12 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none text-sm bg-white dark:bg-slate-800 text-[#0A1B2A] dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggle}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label="Cambiar tema"
            >
              {theme === 'light' ? <Moon className="w-5 h-5 text-[#0A1B2A] dark:text-slate-200" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-6 h-6 text-[#0A1B2A] dark:text-slate-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00BFA6] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Menú"
            >
              {mobileOpen ? <X className="w-6 h-6 dark:text-slate-200" /> : <Menu className="w-6 h-6 dark:text-slate-200" />}
            </button>
          </div>
        </div>

        {/* Categories + nav */}
        <nav className="hidden md:flex items-center gap-1 pb-3 -mt-1 flex-wrap">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A1B2A] dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-[#0A1B2A]/90 dark:hover:bg-slate-600"
          >
            <Menu className="w-4 h-4" />
            Categorías
          </Link>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition',
                  isActive ? 'text-[#2563EB] border-b-2 border-[#2563EB]' : 'text-gray-700 dark:text-slate-300 hover:text-[#0A1B2A] dark:hover:text-white'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 space-y-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar productos, marcas..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-[#0A1B2A] dark:text-slate-100"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              </button>
            </form>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block py-2 px-3 rounded-lg text-sm font-medium',
                    isActive ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
