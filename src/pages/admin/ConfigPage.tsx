import { useState } from 'react';
import { Save, Building2, Mail, Phone, Percent, Check, Send } from 'lucide-react';
import { useApp } from '../../store';

export function ConfigPage() {
  const { siteConfig, updateSiteConfig } = useApp();
  const [form, setForm] = useState(siteConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[#0A1B2A] dark:text-slate-100 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Configuración
      </h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Personaliza la información de tu tienda y reglas de negocio.</p>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-4 dark:text-slate-100">
            <Building2 className="w-4 h-4 text-[#2563EB]" /> Información de la empresa
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Nombre de la empresa</label>
              <input
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Dirección</label>
              <input
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3 h-3" /> WhatsApp de ventas
              </label>
              <input
                value={form.whatsappNumber}
                onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
                placeholder="+50588888888"
              />
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                Número al que se enviarán las cotizaciones. Formato internacional sin + ni espacios.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email de ventas (Resend)
              </label>
              <input
                value={form.salesEmail}
                onChange={e => setForm({ ...form, salesEmail: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
                type="email"
              />
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
                Email del agente que recibirá las notificaciones de nuevas cotizaciones.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-4 dark:text-slate-100">
            <Percent className="w-4 h-4 text-[#00BFA6]" /> Reglas de negocio
          </h2>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Cantidad mínima para precio distribuidor</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="number"
                min={1}
                value={form.minDistributorQty}
                onChange={e => setForm({ ...form, minDistributorQty: +e.target.value })}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              />
              <span className="text-sm text-gray-600 dark:text-slate-300">unidades</span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-2">
              A partir de esta cantidad de productos en el carrito, se aplica automáticamente el precio distribuidor (no es seleccionable por el cliente).
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-300">
            <Send className="w-4 h-4" /> Notificaciones por Email (Resend / EmailJS)
          </h2>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-3">
            Las cotizaciones se notifican por <strong>dos canales en simultáneo</strong> para no perder ninguna venta:
          </p>
          <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1 list-disc pl-5 mb-3">
            <li>📱 <strong>WhatsApp</strong>: se abre con el mensaje prellenado al número del cliente.</li>
            <li>✉️ <strong>Email</strong>: se envía automáticamente al correo del agente (<code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded">{form.salesEmail}</code>) con todos los datos de la cotización.</li>
          </ul>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
            Para activar el email en producción, configura las variables de entorno <code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded">VITE_EMAILJS_SERVICE_ID</code>, <code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded">VITE_EMAILJS_TEMPLATE_ID</code> y <code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded">VITE_EMAILJS_PUBLIC_KEY</code> en tu archivo <code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded">.env</code>. EmailJS permite usar Resend, SendGrid, Gmail o cualquier SMTP bajo el capó.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-semibold text-sm inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar cambios
          </button>
          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
              <Check className="w-4 h-4" /> Guardado correctamente
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
