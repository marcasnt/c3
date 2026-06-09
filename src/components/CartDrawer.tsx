import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { ProductImage } from './ProductImage';

export function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, updateQuantity, removeFromCart, cartCount, siteConfig } = useApp();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  // Auto-calc: distributor price when total qty >= minimum
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const qualifiesForDistributor = totalQty >= siteConfig.minDistributorQty;
  const priceType = qualifiesForDistributor ? 'distributor' : 'public';

  // Recompute the actual total at distributor price when applicable
  const realTotal = cart.reduce((sum, item) => {
    const unit = qualifiesForDistributor ? item.product.priceDistributor : item.product.pricePublic;
    return sum + unit * item.quantity;
  }, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setCartOpen(false)} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-[#0A1B2A] dark:text-slate-100">Tu cotización</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">{cartCount} {cartCount === 1 ? 'producto' : 'productos'} seleccionados</p>
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 dark:text-slate-200" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-3" />
            <h3 className="font-semibold text-lg text-[#0A1B2A] dark:text-slate-100">Tu carrito está vacío</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Agrega productos para generar una cotización</p>
            <button
              onClick={() => { setCartOpen(false); navigate('/catalogo'); }}
              className="mt-4 px-5 py-2.5 bg-[#0A1B2A] dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-[#2563EB] dark:hover:bg-slate-600 transition"
            >
              Ver catálogo
            </button>
          </div>
        ) : (
          <>
            {qualifiesForDistributor && (
              <div className="bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 flex items-center gap-2 text-xs">
                <Tag className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 shrink-0" />
                <span className="text-emerald-800 dark:text-emerald-200 font-semibold">
                  ¡Precio distribuidor aplicado automáticamente! ({totalQty} unidades)
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map(item => {
                const unit = qualifiesForDistributor ? item.product.priceDistributor : item.product.pricePublic;
                return (
                  <div key={`${item.productId}-${item.color}`} className="flex gap-3 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-md shrink-0 flex items-center justify-center p-1">
                      <ProductImage product={item.product} size="full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-[#0A1B2A] dark:text-slate-100 line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{item.product.code} · {item.product.capacity}</p>
                          <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">
                            Color: <span className="font-medium">{item.color}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId, item.color)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-500"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.productId, item.color, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-sm font-semibold text-[#0A1B2A] dark:text-slate-100">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.color, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-slate-400">C$ {unit.toLocaleString('es-NI')} c/u</p>
                          <p className="font-bold text-sm text-[#0A1B2A] dark:text-slate-100">
                            C$ {(unit * item.quantity).toLocaleString('es-NI')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 p-4 space-y-3 bg-gray-50 dark:bg-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-300">Subtotal</span>
                <span className="font-semibold dark:text-slate-100">C$ {realTotal.toLocaleString('es-NI')}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-bold text-[#0A1B2A] dark:text-slate-100">Total</span>
                <span className="font-extrabold text-[#0A1B2A] dark:text-slate-100 text-lg">
                  C$ {realTotal.toLocaleString('es-NI')}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">
                {priceType === 'distributor'
                  ? `✅ Precio distribuidor aplicado (compra de ${totalQty} unidades)`
                  : `ℹ️ Precio público. Aplica distribuidor con ${siteConfig.minDistributorQty}+ unidades (tienes ${totalQty}).`}
              </p>
              <button
                onClick={() => { setCartOpen(false); navigate('/checkout'); }}
                className="w-full bg-[#0A1B2A] hover:bg-[#2563EB] dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Generar cotización por WhatsApp
              </button>
              <button
                onClick={() => { setCartOpen(false); navigate('/catalogo'); }}
                className="w-full border border-gray-300 dark:border-slate-600 hover:border-[#0A1B2A] dark:hover:border-slate-400 text-[#0A1B2A] dark:text-slate-200 font-medium py-2.5 rounded-lg text-sm transition"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
