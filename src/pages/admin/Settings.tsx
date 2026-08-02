import { useState } from 'react';
import { Save, ShieldCheck, Bell, Palette } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    storeName: 'Nimbus Store',
    notifyLowStock: true,
    darkModeDefault: true,
  });

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nimbus-admin-settings', JSON.stringify(form));
    toast('Admin settings saved', 'success');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl">Admin settings</h1>
        <p className="text-sm text-ink-500">Adjust the basics for your store’s admin experience.</p>
      </div>

      <form onSubmit={saveSettings} className="space-y-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary-600" />
            <h2 className="font-display font-bold text-xl">Store preferences</h2>
          </div>
          <label className="block text-sm font-medium">Store name</label>
          <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="input mt-2" />
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-accent-500" />
            <h2 className="font-display font-bold text-xl">Notifications</h2>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.notifyLowStock} onChange={(e) => setForm({ ...form, notifyLowStock: e.target.checked })} />
            Notify about low-stock items
          </label>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-success-600" />
            <h2 className="font-display font-bold text-xl">Security</h2>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.darkModeDefault} onChange={(e) => setForm({ ...form, darkModeDefault: e.target.checked })} />
            Use dark mode by default in admin
          </label>
        </div>

        <div className="flex justify-end">
          <button className="btn-primary inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save settings</button>
        </div>
      </form>
    </div>
  );
}
