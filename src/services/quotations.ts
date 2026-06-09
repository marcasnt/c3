import { supabase } from '../lib/supabase';
import type { Quotation, CartItem } from '../types';

export interface CreateQuotationData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNote?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  priceType: 'public' | 'distributor';
}

export async function createQuotation(data: CreateQuotationData): Promise<Quotation> {
  const id = `COT-${Date.now().toString(36).toUpperCase()}`;

  // 1. Insertar cotización
  const { data: quotation, error: qError } = await supabase
    .from('quotations')
    .insert({
      id,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail || null,
      customer_note: data.customerNote || null,
      subtotal: data.subtotal,
      total: data.total,
      price_type: data.priceType,
      status: 'nueva',
      source: 'web',
    })
    .select()
    .single();

  if (qError) throw qError;

  // 2. Insertar items
  const itemsToInsert = data.items.map(item => ({
    quotation_id: id,
    product_id: item.productId,
    product_code: item.product.code,
    product_name: item.product.name,
    brand_name: item.product.brand,
    color: item.color,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.unitPrice * item.quantity,
  }));

  const { error: iError } = await supabase
    .from('quotation_items')
    .insert(itemsToInsert);

  if (iError) throw iError;

  return quotation as Quotation;
}

// Admin: obtener todas las cotizaciones
export async function fetchQuotations(): Promise<Quotation[]> {
  const { data, error } = await supabase
    .from('quotations')
    .select(`
      *,
      items:quotation_items(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Quotation[];
}

// Admin: actualizar estado
export async function updateQuotationStatus(id: string, status: Quotation['status']): Promise<void> {
  const updates: any = { status };
  if (status === 'contactado') updates.contacted_at = new Date().toISOString();
  if (status === 'cerrada') updates.closed_at = new Date().toISOString();

  const { error } = await supabase
    .from('quotations')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// Admin: eliminar
export async function deleteQuotation(id: string): Promise<void> {
  const { error } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
