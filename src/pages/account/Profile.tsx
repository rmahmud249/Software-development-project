import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, TABLES } from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.user_metadata?.full_name ?? '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone ?? '');
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from(TABLES.orders).select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from(TABLES.wishlists).select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from(TABLES.addresses).select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([o, w, a]) => setStats({ orders: o.count ?? 0, wishlist: w.count ?? 0, addresses: a.count ?? 0 }));
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: name, phone } });
      if (error) throw error;
      toast('Profile updated', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Profile</h1>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Orders', value: stats.orders },
          { label: 'Wishlist', value: stats.wishlist },
          { label: 'Addresses', value: stats.addresses },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="font-display font-bold text-2xl">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="glass-card p-6 mt-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1.5" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input value={user?.email ?? ''} disabled className="input mt-1.5 opacity-60" />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input mt-1.5" placeholder="+1 …" />
        </div>
        <div className="sm:col-span-2">
          <button disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
