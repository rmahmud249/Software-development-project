import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, Truck, Wallet, Banknote, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase, TABLES } from '../services/supabaseClient';
import { formatPrice } from '../utils/format';

type PayMethod = 'card' | 'paypal' | 'cod';

export default function Checkout() {
  const { items, subtotal, shipping, total, couponCode, couponDiscount, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>('');
  const [pay, setPay] = useState<PayMethod>('card');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; number: string } | null>(null);

  // new address form
  const [form, setForm] = useState({
    full_name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'United States',
  });
  const [useNew, setUseNew] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from(TABLES.addresses).select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => {
        setAddresses(data ?? []);
        if (data && data.length > 0) setSelectedAddr(data[0].id);
        else setUseNew(true);
      });
  }, [user]);

  if (items.length === 0 && !placed) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="font-display font-bold text-2xl">Your cart is empty</h1>
        <Link to="/shop" className="btn-primary mt-4 inline-flex">Shop now</Link>
      </div>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!useNew && !selectedAddr) { toast('Select a shipping address', 'error'); return; }
    setPlacing(true);
    try {
      const addr = useNew ? form : addresses.find((a) => a.id === selectedAddr);
      if (useNew) {
        const { data } = await supabase.from(TABLES.addresses).insert({ ...form, user_id: user.id }).select('*').single();
        if (data) { setAddresses((p) => [data, ...p]); }
      }
      const { data: order, error } = await supabase.from(TABLES.orders).insert({
        user_id: user.id,
        subtotal, discount: couponDiscount, shipping, total,
        coupon_code: couponCode,
        shipping_address: addr,
        payment_method: pay,
        status: 'processing',
      }).select('id, order_number').single();
      if (error) throw error;
      await supabase.from(TABLES.orderItems).insert(
        items.map((i) => ({ order_id: order.id, product_id: i.product_id, title: i.title, image_url: i.image, price: i.price, quantity: i.quantity })),
      );
      await clear();
      setPlaced({ id: order.id, number: order.order_number });
      toast('Order placed successfully!', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Could not place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <div className="container-app py-20 text-center">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-success-500/15 grid place-items-center text-success-500 mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-display font-bold text-3xl">Order confirmed!</h1>
        <p className="mt-2 text-ink-500">Thank you for your purchase. Your order <span className="font-semibold text-ink-700 dark:text-ink-200">{placed.number}</span> is being processed.</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link to="/account/orders" className="btn-primary">Track order</Link>
          <Link to="/shop" className="btn-outline">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="font-display font-bold text-3xl">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-6 grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          {/* address */}
          <section className="glass-card p-6">
            <h2 className="font-display font-bold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" /> Shipping address</h2>
            {addresses.length > 0 && (
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {addresses.map((a) => (
                  <button type="button" key={a.id} onClick={() => { setSelectedAddr(a.id); setUseNew(false); }} className={`text-left p-4 rounded-xl border-2 transition ${!useNew && selectedAddr === a.id ? 'border-primary-600 bg-primary-50/50 dark:bg-white/5' : 'border-ink-200 dark:border-white/10'}`}>
                    <p className="font-semibold text-sm">{a.full_name}</p>
                    <p className="text-sm text-ink-500">{a.line1}, {a.city}, {a.state} {a.postal_code}</p>
                    <p className="text-sm text-ink-500">{a.phone}</p>
                  </button>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setUseNew((v) => !v)} className="mt-4 text-sm text-primary-600 font-semibold hover:underline">
              {useNew ? 'Use saved address' : '+ Add new address'}
            </button>
            {useNew && (
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <Inp label="Full name" v={form.full_name} on={(v) => setForm({ ...form, full_name: v })} required />
                <Inp label="Phone" v={form.phone} on={(v) => setForm({ ...form, phone: v })} required />
                <Inp label="Address line 1" v={form.line1} on={(v) => setForm({ ...form, line1: v })} required full />
                <Inp label="Address line 2 (optional)" v={form.line2} on={(v) => setForm({ ...form, line2: v })} full />
                <Inp label="City" v={form.city} on={(v) => setForm({ ...form, city: v })} required />
                <Inp label="State / Province" v={form.state} on={(v) => setForm({ ...form, state: v })} />
                <Inp label="Postal code" v={form.postal_code} on={(v) => setForm({ ...form, postal_code: v })} />
                <Inp label="Country" v={form.country} on={(v) => setForm({ ...form, country: v })} />
              </div>
            )}
          </section>

          {/* payment */}
          <section className="glass-card p-6">
            <h2 className="font-display font-bold text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-500" /> Payment method</h2>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              {[
                { id: 'card', label: 'Credit card', icon: CreditCard },
                { id: 'paypal', label: 'PayPal', icon: Wallet },
                { id: 'cod', label: 'Cash on delivery', icon: Banknote },
              ].map((m) => (
                <button type="button" key={m.id} onClick={() => setPay(m.id as PayMethod)} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${pay === m.id ? 'border-primary-600 bg-primary-50/50 dark:bg-white/5' : 'border-ink-200 dark:border-white/10'}`}>
                  <m.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            {pay === 'card' && (
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <Inp label="Card number" v="" on={() => {}} full placeholder="4242 4242 4242 4242" />
                <Inp label="Name on card" v="" on={() => {}} />
                <Inp label="Expiry" v="" on={() => {}} placeholder="MM/YY" />
                <Inp label="CVC" v="" on={() => {}} placeholder="123" />
              </div>
            )}
          </section>

          {/* review */}
          <section className="glass-card p-6">
            <h2 className="font-display font-bold text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-primary-500" /> Order review</h2>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={i.product_id} className="flex items-center gap-3">
                  <img src={i.image} alt={i.title} className="h-14 w-14 rounded-lg object-cover bg-ink-100 dark:bg-ink-800" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{i.title}</p>
                    <p className="text-xs text-ink-500">Qty {i.quantity} · {formatPrice(i.price)}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* summary */}
        <aside className="glass-card p-6 h-fit sticky top-32">
          <h2 className="font-display font-bold text-lg">Summary</h2>
          <div className="mt-4 space-y-2.5 text-sm">
            <Row label={`Subtotal (${items.length})`} value={formatPrice(subtotal)} />
            {couponDiscount > 0 && <Row label="Discount" value={`- ${formatPrice(couponDiscount)}`} accent="text-success-600" />}
            <Row label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} accent={shipping === 0 ? 'text-success-600' : ''} />
            <div className="border-t border-ink-200 dark:border-white/10 pt-2.5 flex items-center justify-between font-display font-bold text-lg">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
          <button disabled={placing} className="btn-primary w-full mt-5 py-3">{placing ? 'Placing order…' : 'Place order'}</button>
          <p className="mt-3 text-xs text-ink-400 text-center">By placing your order you agree to our terms.</p>
        </aside>
      </form>
    </div>
  );
}

function Inp({ label, v, on, required, full, placeholder }: { label: string; v: string; on: (v: string) => void; required?: boolean; full?: boolean; placeholder?: string }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="text-sm font-medium">{label}{required && <span className="text-error-500"> *</span>}</label>
      <input value={v} onChange={(e) => on(e.target.value)} required={required} placeholder={placeholder} className="input mt-1.5" />
    </div>
  );
}

function Row({ label, value, accent = '' }: { label: string; value: string; accent?: string }) {
  return <div className="flex items-center justify-between"><span className="text-ink-500">{label}</span><span className={`font-semibold ${accent}`}>{value}</span></div>;
}
