import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast('Welcome back!', 'success');
      navigate('/account');
    } catch (err: any) {
      toast(err.message ?? 'Sign in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-black">Welcome back</h1>
      <p className="mt-2 text-ink-500">Sign in to your Nexora account.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email" icon={Mail}> 
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input rounded-[10px] py-3.5 pl-10 pr-10" placeholder="nexorabd@email.com" />
        </Field>
        <Field label="Password" icon={Lock}>
          <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="input rounded-[10px] py-3.5 pl-10 pr-10" placeholder="••••••••" />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-white">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-black dark:text-ink-300"><input type="checkbox" className="rounded" /> Remember me</label>
          <Link to="/auth/forgot" className="text-[#0B1F8C]   text-sm  font-bold hover:underline">Forgot password?</Link>
        </div>
        <button disabled={loading} className="btn-primary bg-[#0B1F8C]   w-full py-3.5">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ink-200 dark:border-white/10" /></div>
        <span className="relative bg-white dark:bg-ink-900 px-3 text-xs text-ink-400 mx-auto block w-fit">or</span>
      </div>

      <p className="text-center text-sm text-ink-500">
        New to Nexora? <Link to="/auth/register" className="text-[#0B1F8C] font-semibold hover:underline">Create account</Link>
      </p>
    </div>
  );
}

function Field({ label, icon: Icon, children, className }: { label: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-black dark:text-ink-200">{label}</label>
      <div className="relative mt-1.5">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        {children}
      </div>
    </div>
  );
}
