import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AuthLayout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* form side */}
      <div className="flex flex-col p-6 sm:p-10">
        <Link to="/" className="flex items-center gap-2">
          <img src="../images/blue-logo.png" alt="Nexorabd logo"className="h-full w-[200px]" />
        </Link>
        <div className="flex-1 grid place-items-center py-10">
          <div className="w-full max-w-md">
            <button onClick={() => navigate(-1)} className="text-sm font-semibold text-black hover:text-[#0B1F8C] flex items-center gap-1.5 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Outlet />
          </div>
        </div>
      </div>
      {/* visual side */}
      <div className="hidden lg:block relative overflow-hidden bg-gradient-to-r from-[#0B1F8C] via-[#112A9B] to-[#0B1F8C]">
      <div className="absolute inset-0 bg-grid-dark [background-size:40px_40px] opacity-30" />
        <div className="absolute -top-24 -right-24 h-96 w-96"/>
        <div className="absolute bottom-0 left-0 h-80 w-80" />
        <div className="relative h-full flex flex-col justify-center px-12 text-white">
          <ShieldCheck className="w-10 h-10 mb-6" />
          <h2 className="font-display font-bold text-3xl leading-tight">Shop with confidence.</h2>
          <p className="mt-3 text-white/80 max-w-md">
            Secure checkout, encrypted payments, and a 7-day return policy. Your data stays yours.
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm text-white">
            <div><p className="font-display font-bold text-2xl text-yellow-400">12k+</p><p className="font-display font-bold text-xl text-white" >Products</p></div>
            <div><p className="font-display font-bold text-2xl text-yellow-400">98%</p><p className="font-display font-bold text-xl text-white">Satisfaction</p></div>
            <div><p className="font-display font-bold text-2xl text-yellow-400">24/7</p><p className="font-display font-bold text-xl text-white">Support</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
