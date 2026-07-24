import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { items, subtotal, shipping, total, couponCode, couponDiscount, update, remove, applyCoupon, removeCoupon, count } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-ink-100 dark:bg-white/5 grid place-items-center mb-6">
          <ShoppingBag className="w-10 h-10 text-ink-400" />
        </div>
        <h1 className="font-display font-bold text-2xl">Your cart is empty</h1>
        <p className="mt-2 text-ink-500">Looks like you have not added anything yet.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Start shopping <ArrowRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    const res = await applyCoupon(code);
    toast(res.message, res.ok ? 'success' : 'error');
    if (res.ok) setCode('');
    setApplying(false);
  };

  return (
    <div className="container-app py-8">
      <h1 className="font-display font-bold text-3xl">Shopping cart</h1>
      <p className="mt-1 text-ink-500">{count} item{count !== 1 ? 's' : ''}</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        {/* items */}
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.product_id} className="glass-card p-4 flex gap-4">
              <Link to={`/product/${it.slug}`} className="shrink-0">
                <img src={it.image} alt={it.title} className="h-24 w-24 rounded-xl object-cover bg-ink-100 dark:bg-ink-800" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${it.slug}`} className="font-semibold hover:text-primary-600 line-clamp-2">{it.title}</Link>
                <p className="text-sm text-ink-500 mt-0.5">{formatPrice(it.price)} each</p>
                {it.base_price > it.price && <p className="text-xs text-success-600">Save {formatPrice(it.base_price - it.price)} per item</p>}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-ink-200 dark:border-white/10 overflow-hidden">
                    <button onClick={() => update(it.product_id, it.quantity - 1)} className="h-9 w-9 grid place-items-center hover:bg-ink-100 dark:hover:bg-white/5"><Minus className="w-4 h-4" /></button>
                    <span className="w-10 text-center text-sm font-semibold">{it.quantity}</span>
                    <button onClick={() => update(it.product_id, it.quantity + 1)} disabled={it.quantity >= it.stock} className="h-9 w-9 grid place-items-center hover:bg-ink-100 dark:hover:bg-white/5 disabled:opacity-40"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => remove(it.product_id)} className="text-sm text-ink-400 hover:text-error-500 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Remove</button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-lg">{formatPrice(it.price * it.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* summary */}
        <aside className="glass-card p-6 h-fit sticky top-32">
          <h2 className="font-display font-bold text-lg">Order summary</h2>

          {/* coupon */}
          {couponCode ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-success-500/10 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-success-700 dark:text-success-400"><Tag className="w-4 h-4" /> {couponCode}</span>
              <button onClick={removeCoupon} className="text-success-700 hover:text-error-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <form onSubmit={apply} className="mt-4 flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="input py-2.5 uppercase" />
              <button disabled={applying} className="btn-outline px-4">Apply</button>
            </form>
          )}
          <p className="mt-2 text-xs text-ink-400">Try WELCOME10, FREESHIP, or NIMBUS20</p>

          <div className="mt-5 space-y-2.5 text-sm">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {couponDiscount > 0 && <Row label="Discount" value={`- ${formatPrice(couponDiscount)}`} accent="text-success-600" />}
            <Row label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} accent={shipping === 0 ? 'text-success-600' : ''} />
            <div className="border-t border-ink-200 dark:border-white/10 pt-2.5 flex items-center justify-between font-display font-bold text-lg">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>

          {shipping > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-500 bg-primary-50 dark:bg-white/5 rounded-lg px-3 py-2">
              <Truck className="w-4 h-4 text-primary-500" /> Add {formatPrice(75 - subtotal)} for free shipping
            </div>
          )}

          <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-5 py-3">Proceed to checkout <ArrowRight className="w-4 h-4" /></button>
          <Link to="/shop" className="btn-ghost w-full mt-2">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent = '' }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className={`font-semibold ${accent}`}>{value}</span>
    </div>
  );
}
