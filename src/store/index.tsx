import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import type { Product, CartItem, Quotation, AdminUser, SiteConfig } from '../types';
import { fetchProducts as svcFetchProducts, createProduct as svcCreateProduct, updateProduct as svcUpdateProduct, deleteProduct as svcDeleteProduct, saveProductsOrder as svcSaveProductsOrder } from '../services/products';
import { createQuotation as svcCreateQuotation, fetchQuotations as svcFetchQuotations, updateQuotationStatus as svcUpdateQuotationStatus, deleteQuotation as svcDeleteQuotation } from '../services/quotations';
import { signIn as svcSignIn, signOut as svcSignOut, getCurrentProfile } from '../services/auth';
import { fetchPublicConfig, updateConfigValue } from '../services/config';
import { DEFAULT_PRODUCTS } from '../data/products';

interface AppState {
  // Cart (local only, per-browser)
  cart: CartItem[];
  addToCart: (product: Product, color: string, quantity: number, priceType: 'public' | 'distributor') => void;
  removeFromCart: (productId: string, color: string) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Auth
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Quotations
  quotations: Quotation[];
  quotationsLoading: boolean;
  addQuotation: (q: Omit<Quotation, 'id' | 'date' | 'status'>) => Promise<Quotation>;
  updateQuotation: (id: string, q: Partial<Quotation>) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  refreshQuotations: () => Promise<void>;

  // Products
  products: Product[];
  productsLoading: boolean;
  refreshProducts: () => Promise<void>;
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveProductsOrder: (orderedProducts: Product[]) => Promise<void>;

  // Site config
  siteConfig: SiteConfig;
  configLoading: boolean;
  refreshConfig: () => Promise<void>;
  updateSiteConfig: (c: Partial<SiteConfig>) => Promise<void>;

  // Cart UI
  isCartOpen: boolean;
  setCartOpen: (v: boolean) => void;

  // Brand/Category maps (for lookups)
  brandMap: Record<string, string>;
}

const AppContext = createContext<AppState | null>(null);

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem('c3_cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(cart: CartItem[]) {
  try {
    localStorage.setItem('c3_cart', JSON.stringify(cart));
  } catch {
    // noop
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Cart (local storage)
  const [cart, setCart] = useState<CartItem[]>(loadCartFromStorage);

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    whatsappNumber: '+50588888888',
    salesEmail: 'ventas@c3nicaragua.com',
    companyName: 'C3 Nicaragua',
    address: 'Managua, Nicaragua',
    minDistributorQty: 5,
    heroImage: '',
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [brandMap, setBrandMap] = useState<Record<string, string>>({});

  const [isCartOpen, setCartOpen] = useState(false);

  // Persist cart
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // ====== AUTH ======
  const checkSession = useCallback(async () => {
    try {
      const profile = await getCurrentProfile();
      if (profile) {
        setIsAuthenticated(true);
        setCurrentUser(profile);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (err) {
      console.warn('Error al verificar sesión:', err);
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ====== DATA LOADING ======
  const refreshProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await svcFetchProducts();
      if (data && data.length > 0) {
        setProducts(data);
        // Build brand map
        const bMap: Record<string, string> = {};
        data.forEach(p => {
          if (p.brand) bMap[p.brand] = p.brand;
        });
        setBrandMap(bMap);
      } else {
        // Fallback to local seed if Supabase is empty
        console.warn('No hay productos en Supabase, usando seed local');
        setProducts(DEFAULT_PRODUCTS as Product[]);
      }
    } catch (err) {
      console.warn('Error al cargar productos, usando seed local:', err);
      setProducts(DEFAULT_PRODUCTS as Product[]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const refreshQuotations = useCallback(async () => {
    if (!isAuthenticated) return;
    setQuotationsLoading(true);
    try {
      const data = await svcFetchQuotations();
      setQuotations(data);
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err);
      setQuotations([]);
    } finally {
      setQuotationsLoading(false);
    }
  }, [isAuthenticated]);

  const refreshConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const cfg = await fetchPublicConfig();
      setSiteConfig(cfg);
    } catch (err) {
      console.warn('Error al cargar config:', err);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
    refreshConfig();
  }, [refreshProducts, refreshConfig]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshQuotations();
    } else {
      setQuotations([]);
    }
  }, [isAuthenticated, refreshQuotations]);

  // ====== CART ACTIONS ======
  const addToCart: AppState['addToCart'] = (product, color, quantity, priceType) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id && i.color === color);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id && i.color === color
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      const unitPrice = priceType === 'distributor' ? product.priceDistributor : product.pricePublic;
      return [
        ...prev,
        { productId: product.id, product, color, quantity, unitPrice, priceType },
      ];
    });
  };

  const removeFromCart: AppState['removeFromCart'] = (productId, color) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.color === color)));
  };

  const updateQuantity: AppState['updateQuantity'] = (productId, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }
    setCart(prev =>
      prev.map(i => (i.productId === productId && i.color === color ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // ====== AUTH ACTIONS ======
  const login: AppState['login'] = async (email, password) => {
    try {
      const user = await svcSignIn(email, password);
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout: AppState['logout'] = async () => {
    try {
      await svcSignOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setQuotations([]);
  };

  // ====== QUOTATIONS ACTIONS ======
  const addQuotation: AppState['addQuotation'] = async (q) => {
    const newQ = await svcCreateQuotation({
      customerName: q.customerName,
      customerPhone: q.customerPhone,
      customerEmail: q.customerEmail,
      customerNote: q.customerNote,
      items: q.items,
      subtotal: q.subtotal,
      total: q.total,
      priceType: q.items[0]?.priceType || 'public',
    });
    setQuotations(prev => [newQ, ...prev]);
    return newQ;
  };

  const updateQuotation: AppState['updateQuotation'] = async (id, q) => {
    if (q.status) {
      await svcUpdateQuotationStatus(id, q.status);
    }
    setQuotations(prev => prev.map(x => (x.id === id ? { ...x, ...q } : x)));
  };

  const deleteQuotation: AppState['deleteQuotation'] = async (id) => {
    await svcDeleteQuotation(id);
    setQuotations(prev => prev.filter(x => x.id !== id));
  };

  // ====== PRODUCTS ACTIONS ======
  const addProduct: AppState['addProduct'] = async (p) => {
    const created = await svcCreateProduct(p);
    setProducts(prev => [created, ...prev]);
  };

  const updateProduct: AppState['updateProduct'] = async (id, p) => {
    await svcUpdateProduct(id, p);
    setProducts(prev => prev.map(x => (x.id === id ? { ...x, ...p } : x)));
  };

  const deleteProduct: AppState['deleteProduct'] = async (id) => {
    await svcDeleteProduct(id);
    setProducts(prev => prev.filter(x => x.id !== id));
  };

  const saveProductsOrder: AppState['saveProductsOrder'] = async (orderedProducts) => {
    // Update local state first (optimistic UI)
    setProducts(orderedProducts);
    
    // Call service to save orders in database
    const updates = orderedProducts.map((p, index) => ({
      id: p.id,
      sortOrder: p.sortOrder !== undefined ? p.sortOrder : index * 10
    }));
    await svcSaveProductsOrder(updates);
  };

  // ====== CONFIG ACTIONS ======
  const updateSiteConfig: AppState['updateSiteConfig'] = async (c) => {
    setSiteConfig(prev => ({ ...prev, ...c }));

    // Mapear a keys de Supabase y guardar cada uno
    if (c.whatsappNumber !== undefined) await updateConfigValue('whatsapp_number', JSON.stringify(c.whatsappNumber));
    if (c.salesEmail !== undefined) await updateConfigValue('sales_email', JSON.stringify(c.salesEmail));
    if (c.companyName !== undefined) await updateConfigValue('company_name', JSON.stringify(c.companyName));
    if (c.address !== undefined) await updateConfigValue('address', JSON.stringify(c.address));
    if (c.minDistributorQty !== undefined) await updateConfigValue('min_distributor_qty', c.minDistributorQty);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isAuthenticated,
        currentUser,
        authLoading,
        login,
        logout,
        quotations,
        quotationsLoading,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        refreshQuotations,
        products,
        productsLoading,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        saveProductsOrder,
        siteConfig,
        configLoading,
        refreshConfig,
        updateSiteConfig,
        isCartOpen,
        setCartOpen,
        brandMap,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
