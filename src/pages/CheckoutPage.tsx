import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ChevronLeft, Package, User, Phone, Mail, FileText, CheckCircle2, Tag, AlertCircle } from 'lucide-react';
import { useApp } from '../store';
import { ProductImage } from '../components/ProductImage';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';

export function CheckoutPage() {
  const { cart, clearCart, addQuotation, siteConfig } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' });
  const [sent, setSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const qualifiesForDistributor = totalItems >= siteConfig.minDistributorQty;
  const priceType: 'public' | 'distributor' = qualifiesForDistributor ? 'distributor' : 'public';

  // Recalculate cart with auto-applied price
  const adjustedCart = useMemo(() => {
    return cart.map(item => {
      const unit = priceType === 'distributor' ? item.product.priceDistributor : item.product.pricePublic;
      return { ...item, unitPrice: unit, priceType };
    });
  }, [cart, priceType]);

  const subtotal = adjustedCart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const buildMessage = () => {
    const lines: string[] = [];
    lines.push(`*COTIZACIÓN C3 NICARAGUA*`);
    lines.push(``);
    lines.push(`*Cliente:* ${form.name}`);
    lines.push(`*Teléfono:* ${form.phone}`);
    if (form.email) lines.push(`*Email:* ${form.email}`);
    lines.push(`*Fecha:* ${new Date().toLocaleString('es-NI')}`);
    lines.push(`*Tipo de precio aplicado:* ${priceType === 'distributor' ? '✅ DISTRIBUIDOR' : 'ℹ️ PÚBLICO'}`);
    lines.push(`*Total de unidades:* ${totalItems}`);
    lines.push(``);
    lines.push(`*PRODUCTOS:*`);
    lines.push(``);

    adjustedCart.forEach((item, i) => {
      const lineTotal = item.unitPrice * item.quantity;
      lines.push(`${i + 1}. *${item.product.name}* ${item.product.capacity}`);
      lines.push(`   • Código: ${item.product.code}`);
      lines.push(`   • Marca: ${item.product.brand}`);
      lines.push(`   • Color: ${item.color}`);
      lines.push(`   • Cantidad: ${item.quantity}`);
      lines.push(`   • Precio unitario: C$ ${item.unitPrice.toLocaleString('es-NI')}`);
      lines.push(`   • Subtotal: C$ ${lineTotal.toLocaleString('es-NI')}`);
      lines.push(``);
    });

    lines.push(`*TOTAL: C$ ${subtotal.toLocaleString('es-NI')}*`);
    lines.push(``);

    if (priceType === 'distributor') {
      lines.push(`✅ *Precio distribuidor aplicado automáticamente* (compra de ${totalItems} ≥ ${siteConfig.minDistributorQty} unidades)`);
    } else {
      lines.push(`ℹ️ Precio público. Aplica precio distribuidor en compras de ${siteConfig.minDistributorQty}+ unidades.`);
    }

    if (form.note) {
      lines.push(``);
      lines.push(`*Nota del cliente:* ${form.note}`);
    }

    lines.push(``);
    lines.push(`_Cotización generada desde catálogo web C3 (https://c3-nicaragua.vercel.app)._`);
    return lines.join('\n');
  };

  const sendEmailNotification = async (quotationId: string) => {
    // Llama a la Edge Function de Supabase que envía el email via Resend
    try {
      setEmailStatus('sending');
      const { data, error } = await supabase.functions.invoke('send-quotation-email', {
        body: {
          id: quotationId,
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email || undefined,
          customer_note: form.note || undefined,
          subtotal,
          total: subtotal,
          price_type: priceType,
          items: adjustedCart.map(item => ({
            product_name: item.product.name,
            product_code: item.product.code,
            brand_name: item.product.brand,
            color: item.color,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            capacity: item.product.capacity,
          })),
          created_at: new Date().toISOString(),
        },
      });

      if (error) throw error;
      console.log('✅ Email enviado:', data);
      setEmailStatus('sent');
      return true;
    } catch (err) {
      console.error('Error al enviar email:', err);
      setEmailStatus('error');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    // 1) Save quotation internally
    const newQ = await addQuotation({
      customerName: form.name,
      customerPhone: form.phone,
      customerEmail: form.email,
      customerNote: form.note,
      items: adjustedCart,
      subtotal,
      total: subtotal,
    });

    // 2) Send email notification to sales (no bloquea el flujo si falla)
    sendEmailNotification(newQ.id);

    // 3) Open WhatsApp with formatted message
    const msg = buildMessage();
    const url = `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');

    setSent(true);
    clearCart();
  };

  if (cart.length === 0 && !sent) {
    return (
      <div className="fade-in max-w-3xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold dark:text-slate-100">No hay productos en tu cotización</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Agrega productos desde el catálogo para generar tu cotización.</p>
        <Link to="/catalogo" className="inline-block mt-5 px-5 py-2.5 bg-[#0A1B2A] dark:bg-slate-700 text-white rounded-lg font-medium">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="fade-in max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-slate-800 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-8">
          <div className="flex justify-center mb-5">
            <Logo size="lg" />
          </div>
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            ¡Cotización enviada!
          </h2>
          <p className="text-gray-600 dark:text-slate-300 mb-1">
            Tu cotización fue enviada a nuestro equipo de ventas por WhatsApp.
          </p>
          {emailStatus === 'sent' && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">
              ✉️ También notificamos al agente por correo electrónico.
            </p>
          )}
          {emailStatus === 'error' && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">
              ⚠️ No pudimos enviar la notificación por email, pero WhatsApp sí se envió.
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
            Un agente se pondrá en contacto contigo a la brevedad para confirmar tu pedido.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Link to="/catalogo" className="px-4 py-2 bg-[#0A1B2A] dark:bg-slate-700 text-white rounded-lg text-sm font-medium">
              Ver más productos
            </Link>
            <Link to="/" className="px-4 py-2 border border-gray-300 dark:border-slate-600 dark:text-slate-200 rounded-lg text-sm font-medium">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-6xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-slate-300 hover:text-[#2563EB] mb-3">
        <ChevronLeft className="w-4 h-4" /> Volver
      </button>
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Finalizar cotización
      </h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
        Completa tus datos. El precio (público o distribuidor) se calcula automáticamente según la cantidad.
      </p>

      <div className="grid md:grid-cols-[1fr_400px] gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-[#0A1B2A] dark:text-slate-100">
            <User className="w-5 h-5 text-[#2563EB]" /> Tus datos de contacto
          </h2>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Nombre completo *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
              placeholder="Tu nombre y apellido"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Teléfono / WhatsApp *
              </label>
              <input
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] outline-none bg-white dark:bg-slate-700 dark:text-slate-100"
                placeholder="+505 ..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email (opcional)
              </label>
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
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Nota adicional (opcional)
            </label>
            <textarea
              rows={3}
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:border-[#2563EB] outline-none resize-none bg-white dark:bg-slate-700 dark:text-slate-100"
              placeholder="Detalles extra: dirección, hora de entrega, etc."
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Al enviar, abriremos WhatsApp con tu cotización lista para enviar al equipo de ventas. También enviaremos una notificación por email al agente. Tu pedido se registrará internamente.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-5 h-5" /> Enviar cotización por WhatsApp
          </button>
        </form>

        {/* Summary */}
        <aside className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 h-fit md:sticky md:top-28">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2 text-[#0A1B2A] dark:text-slate-100">
            <Package className="w-5 h-5 text-[#2563EB]" /> Tu pedido
          </h2>

          {/* Auto-applied price notice */}
          {qualifiesForDistributor ? (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 flex items-start gap-2">
              <Tag className="w-4 h-4 text-emerald-700 dark:text-emerald-300 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-emerald-800 dark:text-emerald-200">¡Precio distribuidor aplicado!</p>
                <p className="text-emerald-700 dark:text-emerald-300">
                  {totalItems} unidades ≥ {siteConfig.minDistributorQty} requerido.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-3 text-xs">
              <p className="text-gray-600 dark:text-slate-300">
                Tienes <span className="font-bold">{totalItems}</span> unidades. Precio público (distribuidor desde {siteConfig.minDistributorQty}+).
              </p>
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#00BFA6] transition-all"
                  style={{ width: `${Math.min(100, (totalItems / siteConfig.minDistributorQty) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                Te faltan {Math.max(0, siteConfig.minDistributorQty - totalItems)} unidades para el precio mayorista
              </p>
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {adjustedCart.map((item, i) => (
              <div key={`${item.productId}-${item.color}-${i}`} className="flex gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                <div className="w-16 h-16 bg-white dark:bg-slate-600 rounded shrink-0 flex items-center justify-center p-1">
                  <ProductImage product={item.product} size="full" />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold line-clamp-1 text-[#0A1B2A] dark:text-slate-100">{item.product.name}</p>
                  <p className="text-gray-500 dark:text-slate-400">{item.product.code} · {item.color}</p>
                  <p className="text-gray-600 dark:text-slate-300">Cant: <span className="font-semibold">{item.quantity}</span></p>
                  <p className="font-bold text-[#0A1B2A] dark:text-slate-100">C$ {(item.unitPrice * item.quantity).toLocaleString('es-NI')}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-slate-300">Subtotal</span>
              <span className="font-semibold dark:text-slate-100">C$ {subtotal.toLocaleString('es-NI')}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-bold text-[#0A1B2A] dark:text-slate-100">Total</span>
              <span className="font-extrabold text-lg text-[#0A1B2A] dark:text-slate-100">
                C$ {subtotal.toLocaleString('es-NI')}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-2">
              {priceType === 'distributor'
                ? '✅ Precio distribuidor aplicado automáticamente'
                : 'ℹ️ Precio público (subtotal con descuento por volumen automático al llegar a ' + siteConfig.minDistributorQty + ')'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
