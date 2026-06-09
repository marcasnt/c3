import { supabase } from '../lib/supabase';
import type { Quotation, CartItem, Product, Brand } from '../types';

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

function mapDbQuotationToQuotation(dbQuotation: any): Quotation {
  const items: CartItem[] = (dbQuotation.items || []).map((item: any) => {
    // Reconstruct the Product object snapshot
    const product: Product = {
      id: item.product_id,
      code: item.product_code,
      name: item.product_name,
      brand: item.brand_name as Brand,
      category: 'Genéricos', // default since we don't have it in item snapshot, or we can fetch it, but it's fine since it's just for list/details
      capacity: '',
      pricePublic: Number(item.unit_price), // fallback
      priceDistributor: Number(item.unit_price),
      colors: [],
      description: '',
      features: [],
      image: '',
      stock: 0,
      packaging: '',
    };

    return {
      productId: item.product_id,
      product,
      color: item.color,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      priceType: dbQuotation.price_type || 'public',
    };
  });

  return {
    id: dbQuotation.id,
    date: dbQuotation.created_at, // map created_at to date
    customerName: dbQuotation.customer_name,
    customerPhone: dbQuotation.customer_phone,
    customerEmail: dbQuotation.customer_email || undefined,
    customerNote: dbQuotation.customer_note || undefined,
    items,
    subtotal: Number(dbQuotation.subtotal),
    total: Number(dbQuotation.total),
    status: dbQuotation.status,
    notes: dbQuotation.internal_notes || undefined,
  };
}

export async function createQuotation(data: CreateQuotationData): Promise<Quotation> {
  const id = `COT-${Date.now().toString(36).toUpperCase()}`;

  // 1. Insertar cotización
  const { error: qError } = await supabase
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
    });

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

  // Return full Quotation object
  return {
    id,
    date: new Date().toISOString(),
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    customerNote: data.customerNote,
    items: data.items,
    subtotal: data.subtotal,
    total: data.total,
    status: 'nueva',
  };
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
  return (data || []).map(mapDbQuotationToQuotation);
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
