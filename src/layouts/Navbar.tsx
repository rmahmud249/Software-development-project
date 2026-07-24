import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Search, ShoppingBag, Heart, User, Menu, X, Sun, Moon, ChevronDown, Package, LogOut, LayoutDashboard, Sparkles,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchCategories } from '../services/api';
import type { Category } from '../services/api';
import {
  Headphones,
  Headset,
  PhoneCall,
} from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const { count } = useCart();
  const { ids } = useWishlist();
  const { user, signOut, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();

  useEffect(() => { fetchCategories().then(setCats).catch(() => {}); }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
    
      {/* announcement bar */}
      <div className="bg-[#011F7F] text-xs">
        <div className="container-app py-2 flex items-center justify-between gap-4">
          <p className="hidden items-center gap-2 text-white text-[12px] sm:flex">
            <Truck className="h-4 w-4 text-yellow-400" />
            Free Delivery on Orders Over <span className='text-yellow-400 font-semibold'>BDT: 2,000</span>
          </p>
          <p className="mx-auto text-white sm:mx-0">Use code <span className="font-semibold text-yellow-400">WELCOME10</span> for 10% off your first order</p>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/shop" className="text-white text-[12px] font-medium hover:text-yellow-400">Shop</Link>
            <span className="text-white">|</span>
            <Link to="/admin" className="text-white text-[12px] font-medium hover:text-yellow-400">Admin</Link>
          </div>
        </div>
      </div>

      <div className=" bg-gradient-to-r from-[#0B1F8C] via-[#112A9B] to-[#0B1F8C]">
        <div className="container-app py-3 flex items-center gap-4">
        {/* Left - Logo */}
        <div className="w-1/4 flex justify-start">
          <Link to="/" className="shrink-0">
            <img
              src="images/logo.png"
              alt="NexoraBD"
              className="h-12 w-auto"
            />
          </Link>
        </div>
         {/* Search */}
        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-3xl">
          <div className="flex w-full items-center overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">

            {/* Categories */}
            <button
              type="button"
              className="flex items-center gap-2 border-r border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              All Categories
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Search Input */}
            <div className="flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search in NexoraBD..."
                className="h-10 w-full px-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
                aria-label="Search"
              />
            </div>
            {/* Search Button */}
            <button
              type="submit"
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-black transition hover:bg-yellow-500"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

          {/* actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button onClick={toggle} aria-label="Toggle theme" className="h-10 w-10 ml-5 ">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-white  hover:text-yellow-400" /> : <Moon className="w-5 h-5 text-white  hover:text-yellow-400" />}
            </button>
            <Link to="/wishlist" aria-label="Wishlist" className="relative h-10 w-10 grid place-items-center">
              <Heart className="w-5 h-5 text-white hover:text-yellow-400" />
              {ids.length > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent-500 text-white text-[10px] grid place-items-center">{ids.length}</span>}
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative h-10 w-10 grid place-items-center">
              <ShoppingBag className="w-5 h-5 text-white"/>
              {count > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-yellow-400 text-black font-bold text-[10px] grid place-items-center">{count}</span>}
            </Link>

            {user ? (
              <div className="relative" onMouseEnter={() => setUserOpen(true)} onMouseLeave={() => setUserOpen(false)}>
                <button className="h-10 px-2 flex place-items-center rounded-xl hover:bg-ink-100 dark:hover:bg-white/5 transition gap-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center text-white text-xs font-semibold">
                    {(user.email ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full pt-2 w-56">
                    <div className="glass-card p-2 grid gap-1">
                      <div className="px-3 py-2 text-xs text-ink-500 dark:text-ink-400 truncate">{user.email}</div>
                      <Link to="/account" className="px-3 py-2 rounded-lg hover:bg-ink-100 dark:hover:bg-white/5 text-sm flex items-center gap-2"><User className="w-4 h-4" /> My Account</Link>
                      <Link to="/account/orders" className="px-3 py-2 rounded-lg hover:bg-ink-100 dark:hover:bg-white/5 text-sm flex items-center gap-2"><Package className="w-4 h-4" /> Orders</Link>
                      <Link to="/account/wishlist" className="px-3 py-2 rounded-lg hover:bg-ink-100 dark:hover:bg-white/5 text-sm flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist</Link>
                      {isAdmin && <Link to="/admin" className="px-3 py-2 rounded-lg hover:bg-ink-100 dark:hover:bg-white/5 text-sm flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Admin Panel</Link>}
                      <button onClick={() => signOut()} className="px-3 py-2 rounded-lg hover:bg-ink-100 dark:hover:bg-white/5 text-sm flex items-center gap-2 text-error-500"><LogOut className="w-4 h-4" /> Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth/login" className="border border-white rounded-[5px] px-4 py-2 text-sm text-white font-bold hidden sm:inline-flex">Sign in</Link>
            )}

            <button onClick={() => setOpen((v) => !v)} className="lg:hidden h-10 w-10 grid place-items-center rounded-xl hover:bg-ink-100 dark:hover:bg-white/5 transition">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-ink-100 dark:border-white/10">
            <div className="container-app py-4 space-y-3">
              <form onSubmit={submitSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input pl-10" />
              </form>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/" onClick={() => setOpen(false)} className="btn-ghost justify-center">Home</Link>
                <Link to="/shop" onClick={() => setOpen(false)} className="btn-ghost justify-center">Shop</Link>
                {!user && <Link to="/auth/login" onClick={() => setOpen(false)} className="btn-primary justify-center">Sign in</Link>}
                {!user && <Link to="/auth/register" onClick={() => setOpen(false)} className="btn-outline justify-center">Register</Link>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {cats.map((c) => (
                  <Link key={c.id} to={`/shop?category=${c.slug}`} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg bg-ink-50 dark:bg-white/5 text-sm">{c.name}</Link>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Secondary Navigation (Desktop) */}
        <div className="hidden lg:block border-t border-gray-500/50">
          <div className="container-app grid grid-cols-3 items-center py-3">
            {/* Left - Categories */}
            <div className="flex justify-start relative">
              <div
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
              >
                <button className="btn rounded-full bg-white px-10 py-2 text-sm text-black dark:bg-white/5 dark:text-ink-100">
                  <Menu className="w-4 h-4" />
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {catOpen && (
                  <div className="absolute left-0 top-full w-64 pt-2">
                    <div className="grid gap-1 rounded-xl bg-white p-2">
                      <Link
                        to="/shop"
                        className="rounded-lg px-3 py-2 text-sm text-black hover:bg-ink-100 dark:hover:bg-white/5"
                      >
                        All Products
                      </Link>

                      {cats.map((c) => (
                        <Link
                          key={c.id}
                          to={`/shop?category=${c.slug}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-black hover:bg-ink-100 dark:hover:bg-white/5"
                        >
                          <span className="h-2 w-2 rounded-full bg-[#0B1F8C]" />
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center - Navigation */}
            <nav className="flex items-center justify-center gap-2 whitespace-nowrap text-[16px] text-white font-bold">
              <NavItem to="/">Home</NavItem>
              <NavItem to="/shop">Shop</NavItem>
              <NavItem to="/shop?flash=1">Flash Sale</NavItem>
              <NavItem to="/shop?new=1">New Arrivals</NavItem>
              <NavItem to="/shop?best=1">Best Sellers</NavItem>
            </nav>

            {/* Right - Help */}
            <div className="flex items-center justify-end gap-2">
              <Headphones className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white">
                Need help? support@nexorabd.shop
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `px-3 py-1.5  transition ${isActive ? ' text-yellow-400 dark:text-primary-300' : 'text-white  hover:text-yellow-400 hover:border-b-1 border-yellow-400'}`
      }
    >
      {children}
    </NavLink>
  );
}
