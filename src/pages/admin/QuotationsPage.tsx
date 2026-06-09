import { useState, useEffect } from 'react';
import { Search, MessageCircle, CheckCircle2, XCircle, Clock, Trash2, Eye, Mail, Phone, Calendar, Package, Bell, BellOff, Volume2 } from 'lucide-react';
import { useApp } from '../../store';
import type { Quotation } from '../../types';
import { ProductImage } from '../../components/ProductImage';
import { cn } from '../../utils/cn';
import { supabase } from '../../lib/supabase';

const STATUS_LABELS: Record<Quotation['status'], { label: string; color: string; icon: any }> = {
  nueva: { label: 'Nueva', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', icon: Clock },
  contactado: { label: 'Contactado', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', icon: MessageCircle },
  cerrada: { label: 'Cerrada', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300', icon: XCircle },
};

export function QuotationsPage() {
  const { quotations, updateQuotation, deleteQuotation, refreshQuotations } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Quotation['status'] | 'all'>('all');
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [newQuotationAlert, setNewQuotationAlert] = useState<Quotation | null>(null);

  // Suscripción Realtime a cotizaciones nuevas
  useEffect(() => {
    const channel = supabase
      .channel('quotations-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quotations' },
        async (payload) => {
          console.log('🔴 Nueva cotización recibida:', payload.new);
          // Refrescar la lista
          await refreshQuotations();
          // Mostrar alerta
          const newQ = payload.new as Quotation;
          setNewQuotationAlert(newQ);
          // Reproducir sonido si está activado
          if (soundEnabled) {
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
              audio.play().catch(() => {});
            } catch {}
          }
          // Auto-cerrar alerta después de 8s
          setTimeout(() => setNewQuotationAlert(null), 8000);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quotations' },
        async () => {
          await refreshQuotations();
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
        setRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshQuotations, soundEnabled]);

  // Solicitar permiso para notificaciones del navegador
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const filtered = quotations.filter(q => {
    const matchSearch = !search ||
      q.customerName.toLowerCase().includes(search.toLowerCase()) ||
      q.customerPhone.includes(search) ||
      q.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    all: quotations.length,
    nueva: quotations.filter(q => q.status === 'nueva').length,
    contactado: quotations.filter(q => q.status === 'contactado').length,
    cerrada: quotations.filter(q => q.status === 'cerrada').length,
    cancelada: quotations.filter(q => q.status === 'cancelada').length,
  };

  return (
    <div>
      {/* Toast de nueva cotización en vivo */}
      {newQuotationAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-gradient-to-r from-emerald-500 to-[#00BFA6] text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 slide-in-right">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">¡Nueva cotización en vivo!</p>
            <p className="text-xs text-white/90 mt-0.5">
              <strong>{newQuotationAlert.customerName}</strong> · C$ {newQuotationAlert.total.toLocaleString('es-NI')}
            </p>
            <button
              onClick={() => setNewQuotationAlert(null)}
              className="text-[10px] text-white/80 hover:text-white mt-1 underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A1B2A] dark:text-slate-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Cotizaciones
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Gestiona las cotizaciones recibidas y haz seguimiento a las ventas.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Indicador Realtime */}
          <div className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase',
            realtimeActive
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', realtimeActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400')} />
            {realtimeActive ? 'En vivo' : 'Conectando...'}
          </div>
          <button
            onClick={() => {
              setSoundEnabled(v => !v);
              requestNotificationPermission();
            }}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition',
              soundEnabled
                ? 'bg-[#00BFA6] text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            )}
            title={soundEnabled ? 'Sonido activado' : 'Activar sonido'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
          </button>
        </div>
      </div>
      <div className="mb-5" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
        {(['all', 'nueva', 'contactado', 'cerrada', 'cancelada'] as const).map(st => {
          const info = st === 'all' ? { label: 'Todas', color: 'bg-[#0A1B2A] dark:bg-slate-700 text-white' } : STATUS_LABELS[st];
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'p-3 rounded-xl border text-left transition',
                statusFilter === st
                  ? `${info.color} border-transparent`
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-[#2563EB]'
              )}
            >
              <p className="text-xs opacity-80">{info.label}</p>
              <p className="text-2xl font-extrabold">{stats[st]}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o ID..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-12 text-center">
          <MessageCircle className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-semibold text-lg dark:text-slate-100">No hay cotizaciones</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Las cotizaciones generadas por los clientes aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => {
            const st = STATUS_LABELS[q.status];
            const first = q.items[0];
            return (
              <div key={q.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {first && (
                      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-lg shrink-0 border border-gray-100 dark:border-slate-600 p-1">
                        <ProductImage product={first.product} size="sm" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#0A1B2A] dark:text-slate-100">{q.customerName}</p>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1', st.color)}>
                          <st.icon className="w-2.5 h-2.5" />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-mono">
                        {q.id} · <Calendar className="w-2.5 h-2.5 inline" /> {new Date(q.date).toLocaleString('es-NI')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {q.customerPhone}</span>
                        {q.customerEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {q.customerEmail}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 flex items-center gap-1 justify-end">
                      <Package className="w-3 h-3" />
                      {q.items.length} {q.items.length === 1 ? 'producto' : 'productos'} · {q.items.reduce((s, i) => s + i.quantity, 0)} unidades
                    </p>
                    <p className="text-2xl font-extrabold text-[#0A1B2A] dark:text-slate-100">C$ {q.total.toLocaleString('es-NI')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <button
                    onClick={() => setSelected(q)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-xs font-medium inline-flex items-center gap-1 dark:text-slate-200"
                  >
                    <Eye className="w-3 h-3" /> Ver detalle
                  </button>
                  <a
                    href={`https://wa.me/${q.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${q.customerName}, te contactamos de C3 Nicaragua sobre tu cotización ${q.id}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded text-xs font-medium inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp cliente
                  </a>
                  {q.customerEmail && (
                    <a
                      href={`mailto:${q.customerEmail}?subject=${encodeURIComponent(`Cotización ${q.id} - C3 Nicaragua`)}&body=${encodeURIComponent(`Hola ${q.customerName},\n\nGracias por tu interés. Sobre tu cotización ${q.id}...`)}`}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  )}
                  {q.status !== 'cerrada' && (
                    <button
                      onClick={() => updateQuotation(q.id, { status: 'cerrada' })}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded text-xs font-medium inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Marcar cerrada
                    </button>
                  )}
                  {q.status !== 'contactado' && q.status === 'nueva' && (
                    <button
                      onClick={() => updateQuotation(q.id, { status: 'contactado' })}
                      className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded text-xs font-medium inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" /> Marcar contactado
                    </button>
                  )}
                  {q.status !== 'cancelada' && (
                    <button
                      onClick={() => { if (confirm('¿Cancelar cotización?')) updateQuotation(q.id, { status: 'cancelada' }); }}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 rounded text-xs font-medium inline-flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" /> Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm('¿Eliminar?')) deleteQuotation(q.id); }}
                    className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-xs font-medium inline-flex items-center gap-1 ml-auto"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <QuotationDetail q={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function QuotationDetail({ q, onClose }: { q: Quotation; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h2 className="font-bold text-lg text-[#0A1B2A] dark:text-slate-100">Cotización {q.id}</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">{new Date(q.date).toLocaleString('es-NI')}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-2xl leading-none dark:text-slate-200">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-slate-400">Cliente</p>
              <p className="font-semibold dark:text-slate-100">{q.customerName}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-slate-400">Teléfono</p>
              <p className="font-semibold dark:text-slate-100">{q.customerPhone}</p>
            </div>
            {q.customerEmail && (
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 sm:col-span-2">
                <p className="text-xs text-gray-500 dark:text-slate-400">Email</p>
                <p className="font-semibold dark:text-slate-100">{q.customerEmail}</p>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 sm:col-span-2">
              <p className="text-xs text-gray-500 dark:text-slate-400">Tipo de precio</p>
              <p className={`font-semibold ${q.items[0]?.priceType === 'distributor' ? 'text-emerald-600 dark:text-emerald-400' : 'dark:text-slate-100'}`}>
                {q.items[0]?.priceType === 'distributor' ? '✅ Distribuidor' : 'ℹ️ Público'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2 dark:text-slate-100">Productos ({q.items.length})</h3>
            <div className="space-y-2">
              {q.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 text-sm">
                  <div className="w-14 h-14 bg-white dark:bg-slate-600 rounded shrink-0 border border-gray-100 dark:border-slate-500 p-1">
                    <ProductImage product={item.product} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A1B2A] dark:text-slate-100">{item.product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {item.product.code} · {item.color} · Cant: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold dark:text-slate-100">C$ {(item.unitPrice * item.quantity).toLocaleString('es-NI')}</p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400">C$ {item.unitPrice.toLocaleString('es-NI')} c/u</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-300">Subtotal</span>
              <span className="font-semibold dark:text-slate-100">C$ {q.subtotal.toLocaleString('es-NI')}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold mt-1 pt-1 border-t border-gray-200 dark:border-slate-600">
              <span className="dark:text-slate-100">Total</span>
              <span className="dark:text-slate-100">C$ {q.total.toLocaleString('es-NI')}</span>
            </div>
          </div>

          {q.customerNote && (
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Nota del cliente</p>
              <p className="text-amber-700 dark:text-amber-200 mt-1">{q.customerNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
