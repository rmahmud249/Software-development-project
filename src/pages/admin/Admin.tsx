import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, ArrowLeft } from 'lucide-react';

export default function Admin() {
  const items = [
    { to: '/admin', label: 'Products', icon: Package, end: true },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/customers', label: 'Customers', icon: Users },
  ];
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <div className="grid lg:grid-cols-[240px_1fr]">
        <aside className="bg-ink-900 text-ink-200 lg:min-h-screen p-5 lg:sticky lg:top-0 lg:h-screen">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center text-white font-display font-bold">N</div>
            <div>
              <p className="font-display font-bold text-white">Nimbus</p>
              <p className="text-[10px] uppercase tracking-widest text-ink-400">Admin</p>
            </div>
          </Link>
          <nav className="grid gap-1">
            {items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-ink-300 hover:bg-white/5'}`
              }>
                <it.icon className="w-4 h-4" /> {it.label}
              </NavLink>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10 grid gap-1 text-ink-400 text-xs">
              <span className="px-3 py-1.5 flex items-center gap-2"><LayoutDashboard className="w-3.5 h-3.5" /> Dashboard</span>
              <span className="px-3 py-1.5 flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> Analytics</span>
              <span className="px-3 py-1.5 flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> Settings</span>
            </div>
          </nav>
          <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to store
          </Link>
        </aside>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
