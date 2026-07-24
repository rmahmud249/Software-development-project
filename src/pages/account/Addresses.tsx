import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Pencil, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, TABLES } from '../../services/supabaseClient';
import { useToast } from '../../context/ToastContext';

const empty = { full_name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'United States', is_default: false };

export default function Addresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = () => {
    if (!user) return;
    supabase.from(TABLES.addresses).select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setList(data ?? []));
  };
  useEffect(load, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (editId) {
        await supabase.from(TABLES.addresses).update(form).eq('id', editId);
        toast('Address updated', 'success');
      } else {
        await supabase.from(TABLES.addresses).insert({ ...form, user_id: user.id });
        toast('Address added', 'success');
      }
      setOpen(false); setEditId(null); setForm(empty); load();
    } catch (err: any) {
      toast(err.message ?? 'Could not save address', 'error');
    }
  };

  const remove = async (id: string) => {
    await supabase.from(TABLES.addresses).delete().eq('id', id);
    toast('Address removed', 'success');
    load();
  };

  const edit = (a: any) => { setForm({ ...empty, ...a }); setEditId(a.id); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Addresses</h1>
        <button onClick={() => { setForm(empty); setEditId(null); setOpen(true); }} className="btn-primary py-2"><Plus className="w-4 h-4" /> Add</button>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {list.length === 0 && <p className="text-ink-500 sm:col-span-2">No saved addresses yet.</p>}
        {list.map((a) => (
          <div key={a.id} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <MapPin className="w-5 h-5 text-primary-500" />
              <div className="flex gap-1">
                <button onClick={() => edit(a)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-white/5"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(a.id)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-error-500/10 text-error-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="mt-2 font-semibold">{a.full_name}</p>
            <p className="text-sm text-ink-500">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
            <p className="text-sm text-ink-500">{a.city}, {a.state} {a.postal_code}</p>
            <p className="text-sm text-ink-500">{a.country} · {a.phone}</p>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-950/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="glass-card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">{editId ? 'Edit address' : 'New address'}</h2>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
              <Inp label="Full name" v={form.full_name} on={(v) => setForm({ ...form, full_name: v })} required />
              <Inp label="Phone" v={form.phone} on={(v) => setForm({ ...form, phone: v })} required />
              <Inp label="Address line 1" v={form.line1} on={(v) => setForm({ ...form, line1: v })} required full />
              <Inp label="Address line 2" v={form.line2} on={(v) => setForm({ ...form, line2: v })} full />
              <Inp label="City" v={form.city} on={(v) => setForm({ ...form, city: v })} required />
              <Inp label="State" v={form.state} on={(v) => setForm({ ...form, state: v })} />
              <Inp label="Postal code" v={form.postal_code} on={(v) => setForm({ ...form, postal_code: v })} />
              <Inp label="Country" v={form.country} on={(v) => setForm({ ...form, country: v })} />
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
                <button className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Inp({ label, v, on, required, full }: { label: string; v: string; on: (v: string) => void; required?: boolean; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="text-sm font-medium">{label}{required && <span className="text-error-500"> *</span>}</label>
      <input value={v} onChange={(e) => on(e.target.value)} required={required} className="input mt-1.5" />
    </div>
  );
}
