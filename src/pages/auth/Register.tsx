import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = Math.min(4, Math.floor(password.length / 4) + (/[A-Z]/.test(password) ? 1 : 0) + (/[0-9]/.test(password) ? 1 : 0));
  const strengthLabel = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'][strength];
  const strengthColor = ['bg-ink-300', 'bg-error-500', 'bg-warning-500', 'bg-primary-500', 'bg-success-500'][strength];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      await signUp(email, password, name);
      toast('Account created — welcome to Nimbus!', 'success');
      navigate('/account');
    } catch (err: any) {
      toast(err.message ?? 'Sign up failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl">Create your account</h1>
      <p className="mt-2 text-ink-500">Join Nimbus and start shopping smarter.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Full name" icon={User}>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" placeholder="Jane Doe" />
        </Field>
        <Field label="Email" icon={Mail}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@email.com" />
        </Field>
        <Field label="Password" icon={Lock}>
          <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10 pr-10" placeholder="At least 6 characters" />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-white">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </Field>
        {password && (
          <div>
            <div className="flex gap-1 h-1.5">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`flex-1 rounded-full ${i < strength ? strengthColor : 'bg-ink-200 dark:bg-white/10'}`} />)}
            </div>
            <p className="mt-1 text-xs text-ink-500">{strengthLabel}</p>
          </div>
        )}
        <label className="flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
          <input type="checkbox" required className="mt-0.5 rounded" />
          <span>I agree to the <a href="#" className="text-primary-600 hover:underline">Terms</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</span>
        </label>
        <button disabled={loading} className="btn-primary w-full py-3">{loading ? 'Creating account…' : 'Create account'}</button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account? <Link to="/auth/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-700 dark:text-ink-200">{label}</label>
      <div className="relative mt-1.5">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        {children}
      </div>
    </div>
  );
}
