import { Award, Target, Heart, Users, ShieldCheck, TrendingUp, MessageCircle } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="fade-in">
      <section className="brand-gradient-hero text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sobre <span className="text-[#00BFA6]">C3 Nicaragua</span>
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Somos una marca especializada en la venta al por mayor de vasos térmicos de las mejores marcas y genéricos.
          </p>
        </div>
      </section>

      <section className="py-12 max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Tu idea, tu estilo
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
              C3 Nicaragua nace con la misión de ofrecer a distribuidores y emprendedores acceso a vasos térmicos originales de las marcas más reconocidas del mundo, junto con una línea de genéricos de excelente relación calidad-precio.
            </p>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              Nuestra promesa se basa en ofrecer calidad, variedad, precios competitivos y un servicio confiable para que tu negocio crezca de forma sostenida.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: 'CALIDAD', desc: 'Productos de las mejores marcas' },
              { icon: Heart, title: 'VARIEDAD', desc: 'Modelos y estilos para todos los gustos' },
              { icon: TrendingUp, title: 'PRECIOS', desc: 'Exclusivos para distribuidores' },
              { icon: Users, title: 'CONFIANZA', desc: 'Envíos rápidos y soporte personalizado' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition">
                <item.icon className="w-6 h-6 text-[#2563EB] mb-2" />
                <h3 className="font-bold text-sm dark:text-slate-100">{item.title}</h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-slate-800/30 py-12 transition-colors">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Award, value: '500+', label: 'Clientes distribuidores' },
            { icon: Target, value: '7', label: 'Marcas premium' },
            { icon: Heart, value: '98%', label: 'Satisfacción del cliente' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
              <stat.icon className="w-8 h-8 text-[#00BFA6] mx-auto mb-2" />
              <p className="text-3xl font-extrabold text-[#0A1B2A] dark:text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          ¿Listo para ser distribuidor?
        </h2>
        <p className="text-gray-700 dark:text-slate-300 mb-6">
          Contáctanos por WhatsApp y comencemos a trabajar juntos.
        </p>
        <a
          href="https://wa.me/50588888888"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          <MessageCircle className="w-4 h-4" /> Hablar con un asesor
        </a>
      </section>
    </div>
  );
}
