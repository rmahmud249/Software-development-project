import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Twitter, Instagram, Facebook, Youtube, Shield, Truck, Headphones, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast('Thanks for subscribing!', 'success');
    setEmail('');
  };

  return (
    <footer className="mt-20">
      {/* trust badges */}
      <div className="container-app">
        <div className="glass-card grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {[
            { icon: Truck, t: 'Free Shipping', s: 'On orders over BDT 2000' },
            { icon: RefreshCw, t: '7-Day Returns', s: 'Hassle-free returns' },
            { icon: Shield, t: 'Secure Payment', s: 'Encrypted checkout' },
            { icon: Headphones, t: '24/7 Support', s: 'Always here to help' },
          ].map((b) => (
            <div key={b.t} className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 grid place-items-center text-primary-600 dark:text-primary-300">
                <b.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-black dark:text-white">{b.t}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">{b.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-[#0B1F8C] via-[#112A9B] to-[#0B1F8C] text-ink-200">
        <div className="container-app py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" className='h-full w-[200px]' alt="nexora-logo" />
            </Link>
            <p className="mt-4 text-sm text-white max-w-sm">
              A premium marketplace for electronics, fashion, home, and lifestyle. Curated products, fair prices, fast delivery.
            </p>
            <form onSubmit={subscribe} className="mt-6 flex gap-2 max-w-sm">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Your email" className="input rounded-[10px] bg-white border-white/10 text-black placeholder:text-ink-500" />
              <button className="btn-accent bg-yellow-400 px-4 hover:bg-white"><Send className="w-5 h-5 text-black" /></button>
            </form>
            <div className="mt-6 flex items-center gap-3">
              {[Twitter, Instagram, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="h-10 w-10 grid place-items-center rounded-full bg-yellow-400 hover:bg-white transition">
                  <Icon className="w-5 h-5 font-bold text-black" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop" links={[
            { label: 'All products', to: '/shop' },
            { label: 'Flash sale', to: '/shop?flash=1' },
            { label: 'New arrivals', to: '/shop?new=1' },
            { label: 'Best sellers', to: '/shop?best=1' },
          ]} />
          <FooterCol title="Account" links={[
            { label: 'Sign in', to: '/auth/login' },
            { label: 'Register', to: '/auth/register' },
            { label: 'My orders', to: '/account/orders' },
            { label: 'Wishlist', to: '/account/wishlist' },
          ]} />
          <FooterCol title="Company" links={[
            { label: 'About us', to: '/' },
            { label: 'Contact', to: '/' },
            { label: 'Admin', to: '/admin' },
            { label: 'Careers', to: '/' },
          ]} />
        </div>

        <div className="border-t border-white/10">
          <div className="container-app py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ink-200">
            <p>© {new Date().getFullYear()} Nexora. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> support@nexora.shop</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />+8801540759308</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}><Link to={l.to} className="text-white hover:text-white transition">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
