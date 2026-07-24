import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Bell, Globe, Moon, Shield } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Settings</h1>

      <div className="mt-4 space-y-3">
        <Card icon={Moon} title="Appearance" desc="Choose light or dark theme">
          <div className="flex gap-2">
            <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-xl text-sm font-medium border-2 ${theme === 'light' ? 'border-primary-600 bg-primary-50/50' : 'border-ink-200 dark:border-white/10'}`}>Light</button>
            <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-xl text-sm font-medium border-2 ${theme === 'dark' ? 'border-primary-600 bg-primary-50/50 dark:bg-white/10' : 'border-ink-200 dark:border-white/10'}`}>Dark</button>
          </div>
        </Card>

        <Card icon={Bell} title="Notifications" desc="Order updates and offers">
          <button onClick={() => toast('Preferences saved', 'success')} className="btn-outline py-2">Manage</button>
        </Card>

        <Card icon={Globe} title="Language" desc="Multi-language ready">
          <select className="input w-auto" onChange={() => toast('Language updated', 'success')}>
            <option>English</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
        </Card>

        <Card icon={Shield} title="Security" desc="Account and password">
          <span className="text-sm text-ink-500">{user?.email}</span>
        </Card>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl bg-primary-500/10 grid place-items-center text-primary-600 dark:text-primary-300 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-ink-500">{desc}</p>
      </div>
      {children}
    </div>
  );
}
