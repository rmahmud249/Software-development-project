import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { ProductGridSkeleton } from './components/Skeleton';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Account = lazy(() => import('./pages/account/Account'));
const AccountOrders = lazy(() => import('./pages/account/Orders'));
const AccountWishlist = lazy(() => import('./pages/account/Wishlist'));
const AccountAddresses = lazy(() => import('./pages/account/Addresses'));
const AccountProfile = lazy(() => import('./pages/account/Profile'));
const AccountSettings = lazy(() => import('./pages/account/Settings'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="container-app py-12">
      <ProductGridSkeleton count={8} />
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <BrowserRouter>
                <Suspense fallback={<PageFallback />}>
                  <Routes>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:slug" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/account" element={<RequireAuth><Account /></RequireAuth>}>
                        <Route index element={<AccountProfile />} />
                        <Route path="orders" element={<AccountOrders />} />
                        <Route path="wishlist" element={<AccountWishlist />} />
                        <Route path="addresses" element={<AccountAddresses />} />
                        <Route path="settings" element={<AccountSettings />} />
                      </Route>
                      <Route path="/admin" element={<Admin />}>
                        <Route index element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="customers" element={<AdminCustomers />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Route>

                    <Route element={<AuthLayout />}>
                      <Route path="/auth/login" element={<Login />} />
                      <Route path="/auth/register" element={<Register />} />
                      <Route path="/auth/forgot" element={<ForgotPassword />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
