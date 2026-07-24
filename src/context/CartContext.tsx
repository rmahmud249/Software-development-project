import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase, TABLES } from '../services/supabaseClient';
import { useAuth } from './AuthContext';
import type { Product } from '../services/api';

export interface CartLine {
  id: string;          // cart_item id (db) or local id
  product_id: string;
  title: string;
  slug: string;
  image: string;
  price: number;       // unit price (uses sale_price if present)
  base_price: number;  // original price for display
  quantity: number;
  stock: number;
}

interface CartCtx {
  items: CartLine[];
  count: number;
  subtotal: number;
  loading: boolean;
  couponCode: string | null;
  couponDiscount: number;
  shipping: number;
  total: number;
  add: (p: Product, qty?: number) => Promise<void>;
  update: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
}

const Ctx = createContext<CartCtx | undefined>(undefined);
const LOCAL_KEY = 'nimbus-cart';
const FREE_SHIP_THRESHOLD = 75;
const SHIP_FLAT = 9.99;

function priceOf(p: Product) {
  return p.sale_price != null && p.sale_price < p.price ? p.sale_price : p.price;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Load cart on mount / when user changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (user) {
          // Ensure a cart row exists, then load items
          const { data: cart } = await supabase
            .from(TABLES.carts).select('id, coupon_code')
            .eq('user_id', user.id).maybeSingle();
          let cartId = cart?.id;
          if (!cartId) {
            const { data: created, error } = await supabase
              .from(TABLES.carts).insert({ user_id: user.id }).select('id').single();
            if (error) throw error;
            cartId = created.id;
          }
          const { data: lines } = await supabase
            .from(TABLES.cartItems)
            .select('id, product_id, quantity, product:products(*)')
            .eq('cart_id', cartId);
          const mapped: CartLine[] = (lines ?? []).map((l: any) => ({
            id: l.id,
            product_id: l.product_id,
            title: l.product.title,
            slug: l.product.slug,
            image: (l.product.images?.[0]) ?? '',
            price: priceOf(l.product),
            base_price: l.product.price,
            quantity: l.quantity,
            stock: l.product.stock,
          }));
          if (mounted) setItems(mapped);
          if (cart?.coupon_code) setCouponCode(cart.coupon_code);
        } else {
          const local = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]');
          if (mounted) setItems(local);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user) localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }, [items, user]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FLAT;
  const total = Math.max(0, subtotal - couponDiscount) + shipping;

  async function ensureCartId(): Promise<string | null> {
    if (!user) return null;
    const { data: cart } = await supabase.from(TABLES.carts).select('id').eq('user_id', user.id).maybeSingle();
    if (cart) return cart.id;
    const { data, error } = await supabase.from(TABLES.carts).insert({ user_id: user.id }).select('id').single();
    if (error) throw error;
    return data.id;
  }

  async function add(p: Product, qty = 1) {
    const unit = priceOf(p);
    const line: CartLine = {
      id: crypto.randomUUID(),
      product_id: p.id,
      title: p.title,
      slug: p.slug,
      image: p.images?.[0] ?? '',
      price: unit,
      base_price: p.price,
      quantity: qty,
      stock: p.stock,
    };
    if (user) {
      const cartId = await ensureCartId();
      if (cartId) {
        const { data: existing } = await supabase
          .from(TABLES.cartItems).select('id, quantity')
          .eq('cart_id', cartId).eq('product_id', p.id).maybeSingle();
        if (existing) {
          await supabase.from(TABLES.cartItems).update({ quantity: existing.quantity + qty }).eq('id', existing.id);
        } else {
          await supabase.from(TABLES.cartItems).insert({ cart_id: cartId, product_id: p.id, quantity: qty });
        }
      }
    }
    setItems((prev) => {
      const found = prev.find((i) => i.product_id === p.id);
      if (found) return prev.map((i) => i.product_id === p.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, line];
    });
  }

  async function update(productId: string, qty: number) {
    if (qty < 1) return;
    if (user) {
      const cartId = await ensureCartId();
      if (cartId) {
        const { data: existing } = await supabase
          .from(TABLES.cartItems).select('id').eq('cart_id', cartId).eq('product_id', productId).maybeSingle();
        if (existing) await supabase.from(TABLES.cartItems).update({ quantity: qty }).eq('id', existing.id);
      }
    }
    setItems((prev) => prev.map((i) => i.product_id === productId ? { ...i, quantity: Math.min(qty, i.stock) } : i));
  }

  async function remove(productId: string) {
    if (user) {
      const cartId = await ensureCartId();
      if (cartId) await supabase.from(TABLES.cartItems).delete().eq('cart_id', cartId).eq('product_id', productId);
    }
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  async function clear() {
    if (user) {
      const cartId = await ensureCartId();
      if (cartId) await supabase.from(TABLES.cartItems).delete().eq('cart_id', cartId);
    }
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  }

  async function applyCoupon(code: string) {
    const { validateCoupon } = await import('../services/api');
    try {
      const res = await validateCoupon(code.trim().toUpperCase(), subtotal);
      if (!res) return { ok: false, message: 'Invalid or expired coupon.' };
      setCouponCode(res.coupon.code);
      setCouponDiscount(res.discount);
      if (user) {
        const cartId = await ensureCartId();
        if (cartId) await supabase.from(TABLES.carts).update({ coupon_code: res.coupon.code }).eq('id', cartId);
      }
      return { ok: true, message: `Coupon ${res.coupon.code} applied!` };
    } catch {
      return { ok: false, message: 'Could not validate coupon.' };
    }
  }

  function removeCoupon() {
    setCouponCode(null);
    setCouponDiscount(0);
    if (user) {
      ensureCartId().then((id) => { if (id) supabase.from(TABLES.carts).update({ coupon_code: null }).eq('id', id).then(() => {}); });
    }
  }

  return (
    <Ctx.Provider value={{
      items, count, subtotal, loading, couponCode, couponDiscount, shipping, total,
      add, update, remove, clear, applyCoupon, removeCoupon,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
}
