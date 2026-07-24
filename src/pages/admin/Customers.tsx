import { useEffect, useState } from 'react';
import { supabase, TABLES } from '../../services/supabaseClient';
import { formatDate } from '../../utils/format';

export default function AdminCustomers() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aggregate orders per user via the orders table (owner-scoped reads need
    // service role for other users; for the demo we read what anon can see).
    (async () => {
      const { data: orders } = await supabase.from(TABLES.orders).select('user_id, total, created_at');
      const map = new Map<string, { orders: number; spent: number; last: string }>();
      (orders ?? []).forEach((o: any) => {
        const e = map.get(o.user_id) ?? { orders: 0, spent: 0, last: o.created_at };
        e.orders += 1; e.spent += Number(o.total); e.last = o.created_at;
        map.set(o.user_id, e);
      });
      setRows(Array.from(map.entries()).map(([id, v]) => ({ id, ...v })));
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Customers</h1>
      <div className="glass-card overflow-hidden mt-4">
        {loading ? <div className="p-10 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14" />)}</div> : (
          <table className="w-full text-sm">
            <thead className="text-left text-ink-500 border-b border-ink-100 dark:border-white/10">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Orders</th>
                <th className="p-4 font-medium">Total spent</th>
                <th className="p-4 font-medium">Last order</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-ink-500">No customers with orders yet.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-ink-100/60 dark:border-white/5 hover:bg-ink-50/50 dark:hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center text-white font-semibold text-xs">
                        {r.id.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span>
                    </div>
                  </td>
                  <td className="p-4">{r.orders}</td>
                  <td className="p-4 font-semibold">{formatDate(r.last) && ''}{r.spent.toFixed(2)}</td>
                  <td className="p-4 text-ink-500">{formatDate(r.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
