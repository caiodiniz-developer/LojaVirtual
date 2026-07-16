import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AppProviders } from '@/providers/app-providers';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { ScrollProgress } from '@/components/common/scroll-progress';
import { CustomCursor } from '@/components/common/custom-cursor';
import { Navbar } from '@/components/layout/navbar';
import { AnnouncementBar } from '@/features/home/announcement-bar';
import { Footer } from '@/components/layout/footer';
import { SearchCommand } from '@/components/layout/search-command';
import { CartDrawer } from '@/components/layout/cart-drawer';

import HomePage from '@/pages/home';
import ProductsPage from '@/pages/products';
import ProductPage from '@/pages/product';
import CartPage from '@/pages/cart';
import CheckoutPage from '@/pages/checkout';
import CheckoutSuccessPage from '@/pages/checkout-success';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import ForgotPasswordPage from '@/pages/auth/forgot-password';
import ResetPasswordPage from '@/pages/auth/reset-password';
import AccountLayout from '@/layouts/account-layout';
import ProfilePage from '@/pages/account/profile';
import OrdersPage from '@/pages/account/orders';
import OrderDetailPage from '@/pages/account/order-detail';
import AddressesPage from '@/pages/account/addresses';
import WishlistPage from '@/pages/account/wishlist';
import SecurityPage from '@/pages/account/security';
import RewardsPage from '@/pages/account/rewards';
import SharedWishlistPage from '@/pages/shared-wishlist';
import MaintenancePage from '@/pages/maintenance';
import NotFoundPage from '@/pages/not-found';

// The admin area (and its charting library) only loads for admins
const AdminLayout = lazy(() => import('@/layouts/admin-layout'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard'));
const AdminProductsPage = lazy(() => import('@/pages/admin/products'));
const NewProductPage = lazy(() => import('@/pages/admin/product-new'));
const EditProductPage = lazy(() => import('@/pages/admin/product-edit'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/orders'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/categories'));
const AdminCouponsPage = lazy(() => import('@/pages/admin/coupons'));
const AdminUsersPage = lazy(() => import('@/pages/admin/users'));

function ScrollToTop() {
  const { pathname } = useLocation();
  // Braces are required: an arrow that *returns* window.scrollTo(...) makes React
  // treat the return value as a cleanup function → "destroy is not a function".
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Carregando">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();

  return (
    <AppProviders>
      <ScrollToTop />
      <ScrollProgress />
      <CustomCursor />
      <div className="grain" aria-hidden />
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">
          <ErrorBoundary>
            {/* Soft cross-page transition keyed by route */}
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist/:token" element={<SharedWishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<ProfilePage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="addresses" element={<AddressesPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="rewards" element={<RewardsPage />} />
                <Route path="security" element={<SecurityPage />} />
              </Route>

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<NewProductPage />} />
                <Route path="products/:id" element={<EditProductPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>

              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="*" element={<NotFoundPage />} />
              </Routes>
              </Suspense>
            </motion.div>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
      <SearchCommand />
      <CartDrawer />
    </AppProviders>
  );
}
