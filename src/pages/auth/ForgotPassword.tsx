import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast('Reset link sent', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Could not send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-success-500/15 grid place-items-center text-success-500 mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="font-display font-bold text-3xl">Check your inbox</h1>
        <p className="mt-2 text-ink-500">We sent a password reset link to <span className="font-semibold text-ink-700 dark:text-ink-200">{email}</span>.</p>
        <Link to="/auth/login" className="btn-primary mt-6 inline-flex">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display font-bold text-3xl">Forgot password</h1>
      <p className="mt-2 text-ink-500">Enter your email and we will send you a reset link.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@email.com" />
          </div>
        </div>
        <button disabled={loading} className="btn-primary w-full py-3">{loading ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Remembered it? <Link to="/auth/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
