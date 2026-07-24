import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: '/account', label: 'Profile', icon: User, end: true },
    { to: '/account/orders', label: 'Orders', icon: Package },
    { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/account/addresses', label: 'Addresses', icon: MapPin },
    { to: '/account/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container-app py-8">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="glass-card p-5 h-fit sticky top-32">
          <div className="flex items-center gap-3 pb-4 border-b border-ink-200 dark:border-white/10">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center text-white font-display font-bold">
              {(user?.email ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{user?.user_metadata?.full_name ?? 'Shopper'}</p>
              <p className="text-xs text-ink-500 truncate">{user?.email}</p>
            </div>
          </div>
          <nav className="mt-3 grid gap-1">
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${isActive ? 'bg-primary-50 dark:bg-white/10 text-primary-700 dark:text-primary-300 font-semibold' : 'text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/5'}`
              }>
                <it.icon className="w-4 h-4" /> {it.label}
              </NavLink>
            ))}
            <button onClick={async () => { await signOut(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-error-500 hover:bg-error-500/10 transition">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </nav>
        </aside>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
