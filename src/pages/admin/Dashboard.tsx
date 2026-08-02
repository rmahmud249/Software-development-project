import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';
import { formatPrice, formatDate } from '../../utils/format';

interface DashboardStats {
  totalProducts: number;
  outOfStock: number;
  totalOrders: number;
  revenue: number;
  customers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    outOfStock: 0,
    totalOrders: 0,
    revenue: 0,
    customers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: products }, { data: orders }] = await Promise.all([
          supabase.from(TABLES.products).select('*'),
          supabase.from(TABLES.orders).select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        const productItems = products ?? [];
        const orderItems = orders ?? [];
        const customerIds = new Set<string>(orderItems.map((o: any) => o.user_id).filter(Boolean));

        setStats({
          totalProducts: productItems.length,
          outOfStock: productItems.filter((p: any) => Number(p.stock) === 0).length,
          totalOrders: orderItems.length,
          revenue: orderItems.reduce((sum: number, order: any) => sum + Number(order.total ?? 0), 0),
          customers: customerIds.size,
        });
        setRecentOrders(orderItems);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const highlightCards = useMemo(() => [
    { label: 'Products', value: stats.totalProducts, icon: Package, accent: 'text-primary-600' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingCart, accent: 'text-accent-500' },
    { label: 'Customers', value: stats.customers, icon: Users, accent: 'text-success-600' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, accent: 'text-warning-600' },
  ], [stats]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Admin dashboard</h1>
          <p className="text-sm text-ink-500">A quick overview of your catalog, orders, and customer activity.</p>
        </div>
        <Link to="/admin/products" className="btn-outline inline-flex items-center gap-2">
          Manage catalog <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-6">
        {highlightCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-500">{card.label}</p>
                <Icon className={`w-5 h-5 ${card.accent}`} />
              </div>
              <p className="mt-3 font-display font-bold text-2xl">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Inventory</p>
              <h2 className="font-display font-bold text-xl">Stock overview</h2>
            </div>
            <span className="text-sm text-ink-500">{stats.outOfStock} out of stock</span>
          </div>
          <div className="rounded-2xl bg-ink-50 dark:bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm text-ink-500">
              <span>Products in catalog</span>
              <span className="font-semibold text-ink-900 dark:text-white">{stats.totalProducts}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-ink-200 dark:bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.min(100, (stats.totalProducts / Math.max(1, stats.totalProducts + 5)) * 100)}%` }} />
            </div>
            <p className="mt-3 text-sm text-ink-500">Keep an eye on low-stock items and restock popular products before demand rises.</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Latest activity</p>
              <h2 className="font-display font-bold text-xl">Recent orders</h2>
            </div>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-ink-100 dark:border-white/10 px-3 py-3">
                  <div>
                    <p className="font-semibold">{order.order_number ?? 'Order'}</p>
                    <p className="text-xs text-ink-500">{formatDate(order.created_at)}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
