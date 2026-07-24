import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.resolve(supabase.from(TABLES.orders)
      .select('*, items:order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }))
      .then(({ data }) => { setOrders(data ?? []); })
      .catch(() => {})
      .then(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="glass-card p-10 skeleton h-40" />;

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="font-display font-bold text-2xl">Orders</h1>
        <div className="glass-card p-12 text-center mt-4">
          <Package className="w-10 h-10 mx-auto text-ink-400 mb-3" />
          <p className="text-ink-500">No orders yet.</p>
          <Link to="/shop" className="btn-primary mt-4 inline-flex">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Orders</h1>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="glass-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{o.order_number}</p>
                <p className="text-xs text-ink-500">{formatDate(o.created_at)}</p>
              </div>
              <span className={`chip ${STATUS_STYLES[o.status] ?? ''} capitalize`}>{o.status}</span>
              <p className="font-display font-bold">{formatPrice(o.total)}</p>
            </div>
            <div className="mt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
              {(o.items ?? []).map((it: any) => (
                <img key={it.id} src={it.image_url} alt={it.title} className="h-12 w-12 rounded-lg object-cover bg-ink-100 dark:bg-ink-800 shrink-0" />
              ))}
              <span className="ml-auto text-sm text-primary-600 font-semibold flex items-center gap-1 hover:underline">
                Track <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
