import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AuthLayout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* form side */}
      <div className="flex flex-col p-6 sm:p-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 grid place-items-center text-white font-display font-bold">N</div>
          <span className="font-display font-bold text-xl">Nimbus</span>
        </Link>
        <div className="flex-1 grid place-items-center py-10">
          <div className="w-full max-w-md">
            <button onClick={() => navigate(-1)} className="text-sm text-ink-500 hover:text-primary-600 flex items-center gap-1.5 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Outlet />
          </div>
        </div>
      </div>
      {/* visual side */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500">
        <div className="absolute inset-0 bg-grid-dark [background-size:40px_40px] opacity-30" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent-300/20 blur-3xl" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <ShieldCheck className="w-10 h-10 mb-6" />
          <h2 className="font-display font-bold text-3xl leading-tight">Shop with confidence.</h2>
          <p className="mt-3 text-white/80 max-w-md">
            Secure checkout, encrypted payments, and a 30-day return policy. Your data stays yours.
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm text-white/80">
            <div><p className="font-display font-bold text-2xl text-white">12k+</p><p>Products</p></div>
            <div><p className="font-display font-bold text-2xl text-white">98%</p><p>Satisfaction</p></div>
            <div><p className="font-display font-bold text-2xl text-white">24/7</p><p>Support</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
