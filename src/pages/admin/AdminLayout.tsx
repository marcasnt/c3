import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, Settings, LogOut, ChevronLeft, Sun, Moon } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { useApp } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/cotizaciones', label: 'Cotizaciones', icon: MessageSquare },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export function AdminLayout() {
  const { isAuthenticated, currentUser, logout } = useApp();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-[#2563EB] mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> Volver al sitio
        </button>

        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 h-fit md:sticky md:top-28">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700 mb-3">
              <Logo size="sm" />
              <button
                onClick={toggle}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                aria-label="Cambiar tema"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Sesión iniciada como</p>
            <p className="font-semibold text-sm text-[#0A1B2A] dark:text-slate-100 mb-1">{currentUser?.name}</p>
            <span className="text-[10px] uppercase font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded">
              {currentUser?.role}
            </span>

            <nav className="mt-4 space-y-1">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition',
                      isActive
                        ? 'bg-[#0A1B2A] dark:bg-slate-700 text-white'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={async () => { await logout(); navigate('/admin/login'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </nav>
          </aside>

          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
