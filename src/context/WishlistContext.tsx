import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, TABLES } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

interface WishlistCtx {
  ids: string[];
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  loading: boolean;
}

const Ctx = createContext<WishlistCtx | undefined>(undefined);
const LOCAL_KEY = 'nimbus-wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (user) {
          const { data } = await supabase.from(TABLES.wishlists).select('product_id').eq('user_id', user.id);
          if (mounted) setIds((data ?? []).map((r) => r.product_id));
        } else {
          if (mounted) setIds(JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]'));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    if (!user) localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  }, [ids, user]);

  const has = (id: string) => ids.includes(id);

  async function toggle(productId: string) {
    if (user) {
      if (ids.includes(productId)) {
        await supabase.from(TABLES.wishlists).delete().eq('user_id', user.id).eq('product_id', productId);
      } else {
        await supabase.from(TABLES.wishlists).insert({ user_id: user.id, product_id: productId });
      }
    }
    setIds((prev) => prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]);
  }

  return (
    <Ctx.Provider value={{ ids, has, toggle, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useWishlist must be used within WishlistProvider');
  return c;
}
