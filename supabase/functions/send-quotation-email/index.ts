// supabase/functions/send-quotation-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SALES_EMAIL = Deno.env.get("SALES_EMAIL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Solo permitir POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const quotation = await req.json();

    // Construir el HTML del email
    const itemsHtml = quotation.items.map((item: any) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">
          <strong>${item.product_name}</strong> ${item.capacity || ''}<br>
          <small>${item.product_code} · ${item.color} · Cant: ${item.quantity}</small>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">
          C$ ${(item.unit_price * item.quantity).toLocaleString('es-NI')}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h1 style="color:#0A1B2A">🛒 Nueva Cotización C3 Nicaragua</h1>
        <p>Has recibido una nueva cotización a través del catálogo web.</p>

        <h2 style="color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:8px">👤 Cliente</h2>
        <p><strong>Nombre:</strong> ${quotation.customer_name}<br>
        <strong>Teléfono:</strong> ${quotation.customer_phone}<br>
        <strong>Email:</strong> ${quotation.customer_email || 'N/A'}</p>

        <h2 style="color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:8px">📦 Productos</h2>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Producto</th>
              <th style="padding:8px;text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h2 style="margin-top:20px;color:#00BFA6">
          💰 Total: C$ ${quotation.total.toLocaleString('es-NI')}
        </h2>
        <p>Tipo de precio aplicado: <strong>${quotation.price_type === 'distributor' ? '✅ Distribuidor' : 'ℹ️ Público'}</strong></p>

        ${quotation.customer_note ? `
          <h3 style="color:#2563EB">📝 Nota del cliente</h3>
          <p style="background:#fef3c7;padding:12px;border-radius:8px">${quotation.customer_note}</p>
        ` : ''}

        <p style="margin-top:30px;color:#666;font-size:12px">
          Cotización generada automáticamente desde el catálogo web.<br>
          Por favor contacta al cliente lo antes posible.
        </p>
      </body>
      </html>
    `;

    // 1. Enviar correo de notificación al Agente de Ventas
    // NOTA: Si usas el Sandbox de Resend (sin dominio verificado), el "from" DEBE ser "onboarding@resend.dev".
    // Si ya tienes un dominio propio verificado en Resend, cambia el "from" a tu dominio (ej: "C3 Nicaragua <cotizaciones@c3nicaragua.com>").
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "C3 Nicaragua <onboarding@resend.dev>",
        to: [SALES_EMAIL],
        subject: `🛒 Nueva cotización ${quotation.id} - C$ ${quotation.total.toLocaleString('es-NI')}`,
        html,
      }),
    });

    if (!res.ok) {
      throw new Error(`Resend admin error: ${await res.text()}`);
    } else {
      console.log(`Notificación enviada con éxito al agente (${SALES_EMAIL})`);
    }

    // 2. Enviar correo de confirmación al Cliente si ingresó su email
    // ⚠️ IMPORTANTE: Si estás usando la cuenta gratuita de Resend (Modo Sandbox),
    // Resend RECHAZARÁ enviar correos a destinatarios externos (clientes) y solo enviará a tu propio correo.
    // Para que les llegue a tus clientes, DEBES registrar y verificar tu dominio personalizado en Resend.
    if (quotation.customer_email) {
      const clientHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h1 style="color:#0A1B2A">🛒 Tu Cotización en C3 Nicaragua</h1>
          <p>Hola <strong>${quotation.customer_name}</strong>,</p>
          <p>Hemos recibido tu solicitud de cotización. Un agente de ventas se pondrá en contacto contigo muy pronto a través de WhatsApp o llamada.</p>
          
          <h2 style="color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:8px">📋 Resumen de tu Pedido (${quotation.id})</h2>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Producto</th>
                <th style="padding:8px;text-align:right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <h2 style="margin-top:20px;color:#00BFA6">
            💰 Total: C$ ${quotation.total.toLocaleString('es-NI')}
          </h2>
          <p>Tipo de precio aplicado: <strong>${quotation.price_type === 'distributor' ? 'Distribuidor' : 'Público'}</strong></p>
          
          <p style="margin-top:30px;color:#666;font-size:12px">
            Gracias por elegir C3 Nicaragua.<br>
            Este es un correo automático de confirmación de solicitud de cotización.
          </p>
        </body>
        </html>
      `;

      const clientRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "C3 Nicaragua <onboarding@resend.dev>",
          to: [quotation.customer_email],
          subject: `🛒 Confirmación de Cotización ${quotation.id} - C3 Nicaragua`,
          html: clientHtml,
        }),
      });

      if (!clientRes.ok) {
        console.error(`Error de Resend al notificar al cliente (${quotation.customer_email}): ${await clientRes.text()}`);
      } else {
        console.log(`Confirmación enviada con éxito al cliente (${quotation.customer_email})`);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error en la Edge Function: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});