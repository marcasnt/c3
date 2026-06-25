export type Brand = 'Stanley' | 'YETI' | 'Owala' | 'Lululemon' | 'Thermos' | 'Disney' | 'Genéricos';

export type Category = 'Todos los vasos' | 'Con tapa y popote' | 'Con asa' | 'Botellas' | 'Kids / Disney' | 'Genéricos' | 'Accesorios';

export interface Color {
  name: string;
  hex: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  brand: Brand;
  category: Category;
  capacity: string;
  pricePublic: number; // C$
  priceDistributor: number; // C$
  colors: Color[];
  description: string;
  features: string[];
  image: string;
  imageUrl?: string; // URL real de imagen subida por el admin
  imageUrl2?: string; // URL de la segunda vista de imagen
  imageUrl3?: string; // URL de la tercera vista de imagen
  stock: number;
  featured?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  packaging: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  color: string;
  quantity: number;
  unitPrice: number; // precio aplicado (public o distributor)
  priceType: 'public' | 'distributor';
}

export interface Quotation {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNote?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  status: 'nueva' | 'contactado' | 'cerrada' | 'cancelada';
  notes?: string;
}

export interface AdminUser {
  id?: string;
  username: string;
  email?: string;
  password?: string;
  name: string;
  full_name?: string;
  role: 'admin' | 'agente' | 'supervisor';
}

export interface SiteConfig {
  whatsappNumber: string;
  salesEmail: string;
  companyName: string;
  address: string;
  minDistributorQty: number;
  heroImage: string;
}
