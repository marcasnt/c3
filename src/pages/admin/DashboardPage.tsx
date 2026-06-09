import { Link } from 'react-router-dom';
import { Package, MessageSquare, DollarSign, TrendingUp, Clock, CheckCircle2, XCircle, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../store';
import { BRAND_INFO } from '../../data/products';
import type { Quotation } from '../../types';
import { ProductImage } from '../../components/ProductImage';

const STATUS_LABELS: Record<Quotation['status'], { label: string; color: string; icon: any }> = {
  nueva: { label: 'Nueva', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', icon: Clock },
  contactado: { label: 'Contactado', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', icon: MessageCircle },
  cerrada: { label: 'Cerrada', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300', icon: XCircle },
};

export function DashboardPage() {
  const { products, quotations } = useApp();

  const stats = {
    totalProducts: products.length,
    totalQuotations: quotations.length,
    newQuotations: quotations.filter(q => q.status === 'nueva').length,
    totalValue: quotations.reduce((s, q) => s + q.total, 0),
    closedSales: quotations.filter(q => q.status === 'cerrada').length,
  };

  const recent = quotations.slice(0, 5);
  const byBrand = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.brand] = (acc[p.brand] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Dashboard
      </h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Resumen general del catálogo y cotizaciones</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Package, label: 'Productos', value: stats.totalProducts, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10 dark:bg-blue-900/30' },
          { icon: MessageSquare, label: 'Cotizaciones', value: stats.totalQuotations, color: 'text-[#00BFA6]', bg: 'bg-[#00BFA6]/10 dark:bg-emerald-900/30' },
          { icon: Clock, label: 'Nuevas', value: stats.newQuotations, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
          { icon: DollarSign, label: 'Valor total', value: `C$ ${stats.totalValue.toLocaleString('es-NI')}`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-[#0A1B2A] dark:text-slate-100">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2 dark:text-slate-100">
              <MessageSquare className="w-4 h-4 text-[#2563EB]" /> Cotizaciones recientes
            </h2>
            <Link to="/admin/cotizaciones" className="text-xs text-[#2563EB] hover:underline font-semibold inline-flex items-center gap-1">
              Ver todas <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">No hay cotizaciones aún.</p>
          ) : (
            <div className="space-y-2">
              {recent.map(q => {
                const st = STATUS_LABELS[q.status];
                const first = q.items[0];
                return (
                  <Link
                    key={q.id}
                    to="/admin/cotizaciones"
                    className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg p-3 transition"
                  >
                    {first && (
                      <div className="w-12 h-12 bg-white dark:bg-slate-600 rounded shrink-0 border border-gray-100 dark:border-slate-500 p-0.5">
                        <ProductImage product={first.product} size="full" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm dark:text-slate-100">{q.customerName}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {q.id} · {q.items.length} {q.items.length === 1 ? 'producto' : 'productos'} · <span className="font-bold text-[#0A1B2A] dark:text-slate-100">C$ {q.total.toLocaleString('es-NI')}</span>
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
          <h2 className="font-bold mb-4 flex items-center gap-2 dark:text-slate-100">
            <TrendingUp className="w-4 h-4 text-[#00BFA6]" /> Distribución por marca
          </h2>
          <div className="space-y-2">
            {Object.entries(byBrand).sort((a, b) => b[1] - a[1]).map(([brand, count]) => {
              const pct = Math.round((count / products.length) * 100);
              return (
                <div key={brand}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">{brand}</span>
                    <span className="text-gray-500 dark:text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: BRAND_INFO[brand as keyof typeof BRAND_INFO].color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
