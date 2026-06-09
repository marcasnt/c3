import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { useApp } from '../../store';

export function AdminLoginPage() {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const ok = await login(user, pass);
      if (ok) {
        navigate('/admin');
      } else {
        setErr('Credenciales incorrectas');
      }
    } catch (err: any) {
      setErr(err?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-[#2563EB] mb-4">
          ← Volver al sitio
        </Link>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="brand-gradient-hero p-6 text-center text-white relative">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/5" />
            <div className="flex justify-center mb-3 relative">
              <Logo size="lg" light variant="compact" />
            </div>
            <h1 className="text-xl font-extrabold relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Panel de Agente de Ventas
            </h1>
            <p className="text-white/80 text-xs mt-1 relative flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Acceso restringido · C3 Nicaragua
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {err && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {err}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <User className="w-3 h-3" /> Usuario
              </label>
              <input
                required
                value={user}
                onChange={e => setUser(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Contraseña
              </label>
              <div className="relative">
                <input
                  required
                  type={show ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5">
                  {show ? <EyeOff className="w-4 h-4 text-gray-500 dark:text-slate-400" /> : <Eye className="w-4 h-4 text-gray-500 dark:text-slate-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Ingresar al panel'}
            </button>

            <div className="text-center text-xs text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-100 dark:border-slate-700">
              <p className="mb-1 font-semibold">Ingresa con tu email y contraseña de Supabase.</p>
              <p>
                Email: <code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">admin@c3nicaragua.com</code>
              </p>
            </div>
          </form>
        </div>

        <a
          href="https://wa.me/50588888888"
          target="_blank"
          rel="noreferrer"
          className="block text-center mt-4 text-sm text-gray-500 dark:text-slate-400 hover:text-[#2563EB]"
        >
          <MessageCircle className="w-4 h-4 inline mr-1" /> ¿Problemas para entrar? Contactar soporte
        </a>
      </div>
    </div>
  );
}
