import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from 'lucide-react';
import { useApp } from '../store';

export function ContactPage() {
  const { siteConfig } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const text = `Hola C3, soy ${form.name}. ${form.message || 'Quisiera más información.'} Tel: ${form.phone}`;
    const cleanPhone = siteConfig.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="fade-in max-w-5xl mx-auto px-4 py-8">
      <nav className="text-xs text-gray-500 dark:text-slate-400 mb-3">
        <Link to="/" className="hover:text-[#2563EB]">Inicio</Link> <span className="mx-1">›</span> <span className="text-[#0A1B2A] dark:text-slate-200 font-medium">Contacto</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Contáctanos
      </h1>
      <p className="text-gray-600 dark:text-slate-300 mb-8">Estamos para ayudarte. Escríbenos por el canal que prefieras.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          {[
            { icon: MessageCircle, title: 'WhatsApp Ventas', value: siteConfig.whatsappNumber, href: `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
            { icon: Phone, title: 'Teléfono', value: siteConfig.whatsappNumber, href: `tel:${siteConfig.whatsappNumber}`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
            { icon: Mail, title: 'Email', value: siteConfig.salesEmail, href: `mailto:${siteConfig.salesEmail}`, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
            { icon: MapPin, title: 'Ubicación', value: siteConfig.address, href: '#', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{item.title}</p>
                <p className="font-semibold text-[#0A1B2A] dark:text-slate-100">{item.value}</p>
              </div>
            </a>
          ))}

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#0A1B2A] dark:text-slate-200" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Horario de atención</p>
              <p className="font-semibold text-sm dark:text-slate-100">Lun-Vie 8:00am - 5:00pm · Sáb 9:00am - 1:00pm</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-lg text-[#0A1B2A] dark:text-slate-100">Envíanos un mensaje</h2>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Nombre completo *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
              placeholder="Tu nombre"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Teléfono *</label>
              <input
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
                placeholder="+505 ..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
                placeholder="tu@email.com"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Mensaje</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] outline-none resize-none bg-white dark:bg-slate-700 dark:text-slate-100"
              placeholder="¿En qué te podemos ayudar?"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4" /> Enviar por WhatsApp
          </button>
          {sent && <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center">¡Mensaje enviado por WhatsApp!</p>}
        </form>
      </div>
    </div>
  );
}
