import { supabase } from '../lib/supabase';
import type { Product, Brand, Category } from '../types';

export interface ProductWithRelations extends Product {
  brand: Brand;
  category: Category;
}

// Obtener todos los productos (público)
export async function fetchProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*)
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as ProductWithRelations[];
}

// Obtener un producto por ID
export async function fetchProduct(id: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ProductWithRelations | null;
}

// Admin: crear producto
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

// Admin: actualizar producto
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// Admin: eliminar producto
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Admin: subir imagen
export async function uploadProductImage(file: File, productCode: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${productCode}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrl;
}
