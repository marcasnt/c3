import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppFab } from './components/WhatsAppFab';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { BrandsPage } from './pages/BrandsPage';
import { AboutPage } from './pages/AboutPage';
import { ShippingPage } from './pages/ShippingPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { QuotationsPage } from './pages/admin/QuotationsPage';
import { ConfigPage } from './pages/admin/ConfigPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppFab />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/catalogo" element={<PublicLayout><CatalogPage /></PublicLayout>} />
          <Route path="/producto/:id" element={<PublicLayout><ProductPage /></PublicLayout>} />
          <Route path="/marcas" element={<PublicLayout><BrandsPage /></PublicLayout>} />
          <Route path="/nosotros" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/envios" element={<PublicLayout><ShippingPage /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />

          {/* Login admin (también con layout público para que aparezca el header y el botón "volver al sitio") */}
          <Route path="/admin/login" element={<PublicLayout><AdminLoginPage /></PublicLayout>} />

          {/* Rutas admin protegidas (NO llevan header público, sólo su propio sidebar) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="productos" element={<ProductsPage />} />
            <Route path="cotizaciones" element={<QuotationsPage />} />
            <Route path="configuracion" element={<ConfigPage />} />
          </Route>

          <Route path="*" element={<PublicLayout><HomePage /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
