import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, Package, ShieldCheck, ArrowRight } from 'lucide-react';

export function ShippingPage() {
  return (
    <div className="fade-in max-w-5xl mx-auto px-4 py-8">
      <nav className="text-xs text-gray-500 dark:text-slate-400 mb-3">
        <Link to="/" className="hover:text-[#2563EB]">Inicio</Link> <span className="mx-1">›</span> <span className="text-[#0A1B2A] dark:text-slate-200 font-medium">Envíos</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Envíos a todo Nicaragua
      </h1>
      <p className="text-gray-600 dark:text-slate-300 mb-8">Recibe tus productos en la puerta de tu negocio, de forma rápida y segura.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: MapPin, title: 'Cobertura nacional', desc: 'Llegamos a todos los departamentos' },
          { icon: Clock, title: '24-72 horas', desc: 'Tiempos ágiles de entrega' },
          { icon: ShieldCheck, title: 'Embalaje seguro', desc: 'Tu pedido llega protegido' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#00BFA6]/10 flex items-center justify-center mb-3">
              <item.icon className="w-6 h-6 text-[#00BFA6]" />
            </div>
            <h3 className="font-bold text-sm dark:text-slate-100">{item.title}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-[#0A1B2A] dark:text-slate-100 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#2563EB]" /> Tarifas de envío
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-2 px-2 font-semibold dark:text-slate-300">Departamento</th>
                <th className="text-left py-2 px-2 font-semibold dark:text-slate-300">Tiempo</th>
                <th className="text-left py-2 px-2 font-semibold dark:text-slate-300">Costo</th>
              </tr>
            </thead>
            <tbody>
              {[
                { dep: 'Managua', time: '24-48 horas', cost: 'C$ 80' },
                { dep: 'León, Granada, Masaya', time: '48 horas', cost: 'C$ 120' },
                { dep: 'Estelí, Matagalpa, Jinotega', time: '48-72 horas', cost: 'C$ 150' },
                { dep: 'Caribe (RAAS, RAAN, Río San Juan)', time: '72 horas', cost: 'C$ 200' },
                { dep: 'Resto del país', time: '48-72 horas', cost: 'C$ 130' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <td className="py-2 px-2 dark:text-slate-200">{row.dep}</td>
                  <td className="py-2 px-2 text-gray-600 dark:text-slate-400">{row.time}</td>
                  <td className="py-2 px-2 font-semibold dark:text-slate-100">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">* Envío gratis en compras mayores a C$ 5,000 dentro de Managua.</p>
      </div>

      <div className="bg-gradient-to-r from-[#0A1B2A] to-[#0E5BA8] dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 text-white text-center">
        <Package className="w-12 h-12 mx-auto mb-3 text-[#00BFA6]" />
        <h2 className="text-2xl font-extrabold mb-2">¿Listo para tu cotización?</h2>
        <p className="text-white/80 mb-5">Arma tu pedido y te enviamos la cotización por WhatsApp al instante.</p>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 bg-[#00BFA6] hover:bg-[#00BFA6]/90 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Ir al catálogo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
