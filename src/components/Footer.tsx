import { Link } from 'react-router-dom';
import { MessageCircle, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';

const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[#0A1B2A] dark:bg-slate-950 text-white mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Logo size="md" light />
            <p className="mt-4 text-sm text-white/70 max-w-sm">
              Catálogo digital diseñado para distribuidores que buscan calidad, variedad y los mejores precios en vasos térmicos originales y genéricos.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/50588888888" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">NAVEGACIÓN</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/" className="hover:text-white">Inicio</Link></li>
              <li><Link to="/catalogo" className="hover:text-white">Catálogo</Link></li>
              <li><Link to="/marcas" className="hover:text-white">Marcas</Link></li>
              <li><Link to="/nosotros" className="hover:text-white">Nosotros</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">AYUDA</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/envios" className="hover:text-white">Envíos y entregas</Link></li>
              <li><Link to="/contacto" className="hover:text-white">Contacto</Link></li>
              <li><Link to="/contacto" className="hover:text-white">Términos y condiciones</Link></li>
              <li><Link to="/contacto" className="hover:text-white">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">CONTACTO</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />+505 8888 8888</li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />ventas@c3nicaragua.com</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />Managua, Nicaragua</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h4 className="font-bold mb-2 text-sm">RECIBE NOVEDADES Y PROMOCIONES</h4>
            <p className="text-sm text-white/70 mb-3">
              Suscríbete para recibir las mejores ofertas exclusivas para distribuidores.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#00BFA6]"
                required
              />
              <button type="submit" className="px-4 py-2 bg-[#00BFA6] hover:bg-[#00BFA6]/90 rounded-lg transition">
                <Send className="w-4 h-4" />
              </button>
            </form>
            {subscribed && <p className="text-xs text-[#00BFA6] mt-2">¡Gracias por suscribirte!</p>}
          </div>

          <div className="text-sm text-white/60 text-right">
            <p>© {new Date().getFullYear()} C3 Nicaragua. Todos los derechos reservados.</p>
            <p className="mt-1">Catálogo digital mayorista de vasos térmicos.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
