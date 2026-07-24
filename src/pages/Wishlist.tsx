import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { fetchProducts, type Product } from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';

export default function Wishlist() {
  const { ids } = useWishlist();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setItems([]); setLoading(false); return; }
    setLoading(true);
    Promise.all(ids.map((id) => fetchProducts({ search: id, pageSize: 1 })))
      .then(() => {
        // simpler: fetch all products and filter
        return import('../services/supabaseClient').then(({ supabase, TABLES }) =>
          supabase.from(TABLES.products).select('*, category:categories(id,name,slug), brand:brands(id,name,slug)').in('id', ids),
        );
      })
      .then(({ data }: any) => {
        setItems((data ?? []).map((p: any) => ({ ...p, images: Array.isArray(p.images) ? p.images : [], tags: Array.isArray(p.tags) ? p.tags : [], sale_price: p.sale_price ?? null })));
      })
      .finally(() => setLoading(false));
  }, [ids]);

  if (ids.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-ink-100 dark:bg-white/5 grid place-items-center mb-6">
          <Heart className="w-10 h-10 text-ink-400" />
        </div>
        <h1 className="font-display font-bold text-2xl">Your wishlist is empty</h1>
        <p className="mt-2 text-ink-500">Tap the heart on any product to save it for later.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse products <ArrowRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="font-display font-bold text-3xl">Wishlist</h1>
      <p className="mt-1 text-ink-500">{ids.length} saved item{ids.length !== 1 ? 's' : ''}</p>
      <div className="mt-6">
        {loading ? <ProductGridSkeleton count={4} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
