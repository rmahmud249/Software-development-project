import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { supabase, TABLES } from '../../services/supabaseClient';
import { formatPrice } from '../../utils/format';

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from(TABLES.orders).select('*').order('created_at', { ascending: false });
        setOrders(data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const avgOrderValue = orders.length ? revenue / orders.length : 0;
    return { revenue, avgOrderValue, completed: orders.filter((o) => o.status === 'delivered').length };
  }, [orders]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Analytics</h1>
          <p className="text-sm text-ink-500">Track order performance at a glance.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-success-500/10 px-3 py-1.5 text-sm text-success-600">
          <ArrowUpRight className="w-4 h-4" /> Healthy momentum
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <div className="glass-card p-4">
          <p className="text-sm text-ink-500">Revenue</p>
          <p className="mt-2 font-display font-bold text-2xl">{formatPrice(summary.revenue)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-ink-500">Average order value</p>
          <p className="mt-2 font-display font-bold text-2xl">{formatPrice(summary.avgOrderValue)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-ink-500">Delivered</p>
          <p className="mt-2 font-display font-bold text-2xl">{summary.completed}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display font-bold text-xl mb-4">Performance snapshot</h2>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : (
          <div className="rounded-2xl bg-ink-50 dark:bg-white/5 p-4 text-sm text-ink-600">
            <p>Orders processed: {orders.length}</p>
            <p className="mt-2">Revenue trend is being tracked from the latest orders in your local admin data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
