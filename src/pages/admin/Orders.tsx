import { useEffect, useMemo, useState } from 'react';
import { supabase, TABLES } from '../../services/supabaseClient';
import { formatPrice, formatDate } from '../../utils/format';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning-500/10 text-warning-600',
  processing: 'bg-primary-500/10 text-primary-600',
  shipped: 'bg-primary-500/10 text-primary-600',
  delivered: 'bg-success-500/10 text-success-600',
  cancelled: 'bg-error-500/10 text-error-500',
  refunded: 'bg-ink-500/10 text-ink-500',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(supabase.from(TABLES.orders).select('*, items:order_items(*)').order('created_at', { ascending: false }))
      .then(({ data }) => { setOrders(data ?? []); })
      .catch(() => {})
      .then(() => setLoading(false));
  }, []);

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total), 0), [orders]);
  const statusCounts = useMemo(() => ({
    processing: orders.filter((o) => o.status === 'processing').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }), [orders]);

  const revenueByDay = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((order) => {
      const label = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[label] = (map[label] ?? 0) + Number(order.total);
    });
    return Object.entries(map).slice(-7).map(([date, total]) => ({ date, total }));
  }, [orders]);

  const maxRevenue = Math.max(...revenueByDay.map((item) => item.total), 1);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Orders</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 mb-6">
        {[
          { label: 'Total orders', value: orders.length },
          { label: 'Revenue', value: formatPrice(revenue) },
          { label: 'Processing', value: statusCounts.processing },
          { label: 'Delivered', value: statusCounts.delivered },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs text-ink-500">{s.label}</p>
            <p className="font-display font-bold text-2xl mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Revenue trend</p>
            <h2 className="font-display font-bold text-xl">Last {revenueByDay.length} days</h2>
          </div>
          <p className="text-sm text-ink-500">Total revenue across recent orders.</p>
        </div>
        <div className="grid grid-cols-7 gap-3 h-48 items-end">
          {revenueByDay.map((point) => (
            <div key={point.date} className="flex flex-col items-center gap-2">
              <div className="w-full rounded-t-xl bg-primary-500 transition-all" style={{ height: `${(point.total / maxRevenue) * 100}%` }} />
              <div className="text-center text-xs text-ink-500">{point.date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-10 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14" />)}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-500 border-b border-ink-100 dark:border-white/10">
                <tr>
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-ink-500">No orders yet.</td></tr>}
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-ink-100/60 dark:border-white/5 hover:bg-ink-50/50 dark:hover:bg-white/5">
                    <td className="p-4 font-medium">{o.order_number}</td>
                    <td className="p-4 text-ink-500">{formatDate(o.created_at)}</td>
                    <td className="p-4">{o.items?.length ?? 0}</td>
                    <td className="p-4 font-semibold">{formatPrice(o.total)}</td>
                    <td className="p-4"><span className={`chip capitalize ${STATUS_STYLES[o.status] ?? ''}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
