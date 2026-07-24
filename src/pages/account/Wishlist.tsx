import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useEffect, useState } from 'react';
import { supabase, TABLES } from '../../services/supabaseClient';
import ProductCard from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/Skeleton';
import type { Product } from '../../services/api';

export default function AccountWishlist() {
  const { ids } = useWishlist();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setItems([]); setLoading(false); return; }
    setLoading(true);
    Promise.resolve(supabase.from(TABLES.products).select('*, category:categories(id,name,slug), brand:brands(id,name,slug)').in('id', ids))
      .then(({ data }: any) => setItems((data ?? []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [], tags: Array.isArray(p.tags) ? p.tags : [], sale_price: p.sale_price ?? null }))))
      .catch(() => {})
      .then(() => setLoading(false));
  }, [ids]);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">Wishlist</h1>
      {ids.length === 0 ? (
        <div className="glass-card p-12 text-center mt-4">
          <Heart className="w-10 h-10 mx-auto text-ink-400 mb-3" />
          <p className="text-ink-500">No saved items.</p>
          <Link to="/shop" className="btn-primary mt-4 inline-flex">Browse products <ArrowRight className="w-4 h-4" /></Link>
        </div>
      ) : loading ? <div className="mt-4"><ProductGridSkeleton count={4} /></div> : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
