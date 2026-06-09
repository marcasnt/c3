import { supabase } from '../lib/supabase';
import type { Product, Brand, Category } from '../types';

export interface ProductWithRelations extends Product {
  brand: Brand;
  category: Category;
}

// Brand and Category IDs for database mapping
const BRAND_IDS: Record<string, number> = {
  'Stanley': 1,
  'YETI': 2,
  'Owala': 3,
  'Lululemon': 4,
  'Thermos': 5,
  'Disney': 6,
  'Genéricos': 7
};

const CATEGORY_IDS: Record<string, number> = {
  'Todos los vasos': 1,
  'Con tapa y popote': 2,
  'Con asa': 3,
  'Botellas': 4,
  'Kids / Disney': 5,
  'Genéricos': 6,
  'Accesorios': 7
};

// Maps a raw database product row to the frontend Product type
function mapDbProductToProduct(dbProduct: any): ProductWithRelations {
  const brandObj = dbProduct.brand;
  const categoryObj = dbProduct.category;

  const brandName = (brandObj && typeof brandObj === 'object' ? brandObj.name : brandObj) || 'Genéricos';
  const categoryName = (categoryObj && typeof categoryObj === 'object' ? categoryObj.name : categoryObj) || 'Genéricos';

  return {
    id: dbProduct.id,
    code: dbProduct.code,
    name: dbProduct.name,
    brand: brandName as Brand,
    category: categoryName as Category,
    capacity: dbProduct.capacity || '',
    pricePublic: Number(dbProduct.price_public),
    priceDistributor: Number(dbProduct.price_distributor),
    colors: dbProduct.colors || [],
    description: dbProduct.description || '',
    features: dbProduct.features || [],
    image: dbProduct.image_url || '',
    imageUrl: dbProduct.image_url || undefined,
    stock: Number(dbProduct.stock) || 0,
    featured: !!dbProduct.is_featured,
    isNew: !!dbProduct.is_new,
    isActive: !!dbProduct.is_active,
    packaging: dbProduct.packaging || '',
  } as ProductWithRelations;
}

// Maps a frontend Product object to the raw database format
function mapProductToDb(product: Partial<Product>): any {
  const dbProduct: any = {};
  if (product.code !== undefined) dbProduct.code = product.code;
  if (product.name !== undefined) dbProduct.name = product.name;
  if (product.capacity !== undefined) dbProduct.capacity = product.capacity;
  if (product.description !== undefined) dbProduct.description = product.description;
  if (product.colors !== undefined) dbProduct.colors = product.colors;
  if (product.features !== undefined) dbProduct.features = product.features;
  if (product.stock !== undefined) dbProduct.stock = product.stock;
  if (product.packaging !== undefined) dbProduct.packaging = product.packaging;

  // Mapped fields
  if (product.pricePublic !== undefined) dbProduct.price_public = product.pricePublic;
  if (product.priceDistributor !== undefined) dbProduct.price_distributor = product.priceDistributor;
  if (product.featured !== undefined) dbProduct.is_featured = product.featured;
  if (product.isNew !== undefined) dbProduct.is_new = product.isNew;
  if (product.isActive !== undefined) dbProduct.is_active = product.isActive;
  
  if (product.imageUrl !== undefined) {
    dbProduct.image_url = product.imageUrl;
  } else if (product.image !== undefined) {
    dbProduct.image_url = product.image;
  }

  if (product.brand !== undefined) {
    dbProduct.brand_id = BRAND_IDS[product.brand] || BRAND_IDS['Genéricos'];
  }
  if (product.category !== undefined) {
    dbProduct.category_id = CATEGORY_IDS[product.category] || CATEGORY_IDS['Genéricos'];
  }

  return dbProduct;
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
  return (data || []).map(mapDbProductToProduct);
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
  if (!data) return null;
  return mapDbProductToProduct(data);
}

// Admin: crear producto
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const dbData = mapProductToDb(product);
  
  // Note: if id is dummy (like p-xxxx), do not insert it to let database generate UUID
  if ('id' in dbData) delete dbData.id;

  const { data, error } = await supabase
    .from('products')
    .insert([dbData])
    .select(`
      *,
      brand:brands(*),
      category:categories(*)
    `)
    .single();

  if (error) throw error;
  return mapDbProductToProduct(data);
}

// Admin: actualizar producto
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const dbData = mapProductToDb(updates);
  const { error } = await supabase
    .from('products')
    .update(dbData)
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
