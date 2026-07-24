import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RefreshCw, ChevronRight, Share2, Check,
} from 'lucide-react';
import { fetchProductBySlug, fetchRelatedProducts, fetchReviews, addReview, type Product, type Review } from '../services/api';
import Rating from '../components/Rating';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, discountPct, formatDate } from '../utils/format';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'desc' | 'reviews'>('desc');
  const [zoom, setZoom] = useState<{ x: number; y: number; on: boolean }>({ x: 50, y: 50, on: false });

  // review form
  const [rRating, setRRating] = useState(5);
  const [rComment, setRComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let m = true;
    setLoading(true);
    setProduct(null);
    fetchProductBySlug(slug).then(async (p) => {
      if (!m || !p) return;
      setProduct(p);
      setActiveImg(0);
      const [rel, rev] = await Promise.all([
        fetchRelatedProducts(p.category_id, p.id, 4),
        fetchReviews(p.id),
      ]);
      if (!m) return;
      setRelated(rel);
      setReviews(rev);
    }).finally(() => { if (m) setLoading(false); });
    return () => { m = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="container-app py-10 grid lg:grid-cols-2 gap-8">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-2/3" />
          <div className="skeleton h-6 w-1/3" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="font-display font-bold text-2xl">Product not found</h1>
        <Link to="/shop" className="btn-primary mt-4">Back to shop</Link>
      </div>
    );
  }

  const off = discountPct(product.price, product.sale_price);
  const wished = has(product.id);

  const onAdd = async () => {
    await add(product, qty);
    toast('Added to cart', 'success');
  };
  const onBuy = async () => {
    await add(product, qty);
    navigate('/cart');
  };
  const onWish = async () => {
    await toggle(product.id);
    toast(wished ? 'Removed from wishlist' : 'Saved to wishlist', 'success');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast('Sign in to leave a review', 'info'); navigate('/auth/login'); return; }
    setSubmitting(true);
    try {
      const r = await addReview({ product_id: product.id, rating: rRating, comment: rComment, author_name: user.email });
      setReviews((prev) => [r, ...prev]);
      setRComment('');
      toast('Review posted', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Could not post review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const images = product.images?.length ? product.images : ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=900'];

  return (
    <div>
      {/* breadcrumb */}
      <div className="container-app pt-6">
        <nav className="text-sm text-ink-500 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-primary-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-primary-600">Shop</Link>
          {product.category && <><ChevronRight className="w-3.5 h-3.5" /><Link to={`/shop?category=${product.category.slug}`} className="hover:text-primary-600">{product.category.name}</Link></>}
          <ChevronRight className="w-3.5 h-3.5" /><span className="text-ink-700 dark:text-ink-200 truncate">{product.title}</span>
        </nav>
      </div>

      <div className="container-app py-8 grid lg:grid-cols-2 gap-8">
        {/* gallery */}
        <div className="lg:sticky lg:top-32 self-start">
          <div
            className="relative aspect-square rounded-3xl overflow-hidden glass-card bg-ink-100 dark:bg-ink-800"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
            }}
            onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          >
            <img
              src={images[activeImg]}
              alt={product.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-200"
              style={zoom.on ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
            {off > 0 && <span className="absolute top-4 left-4 rounded-full bg-error-500 text-white text-xs font-semibold px-3 py-1.5">-{off}%</span>}
            <button onClick={() => navigator.share?.({ title: product.title, url: window.location.href }).catch(() => toast('Link copied', 'info'))} className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full glass hover:bg-white/80 dark:hover:bg-white/10">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded-xl overflow-hidden border-2 transition ${activeImg === i ? 'border-primary-600' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-sm uppercase tracking-wider text-primary-600 dark:text-primary-300 font-semibold">{product.brand?.name ?? 'Nimbus'}</p>
          <h1 className="mt-1 font-display font-bold text-3xl sm:text-4xl text-balance">{product.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} />
            <span className="text-sm text-ink-500">{product.rating.toFixed(1)} · {product.review_count} reviews</span>
            <span className={`chip ${product.stock > 0 ? 'text-success-600' : 'text-error-500'}`}>
              {product.stock > 0 ? <><Check className="w-3 h-3" /> In stock</> : 'Out of stock'}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display font-bold text-4xl">{formatPrice(product.sale_price ?? product.price)}</span>
            {product.sale_price != null && product.sale_price < product.price && (
              <>
                <span className="text-lg text-ink-400 line-through">{formatPrice(product.price)}</span>
                <span className="chip bg-error-500/10 text-error-600">Save {formatPrice(product.price - product.sale_price)}</span>
              </>
            )}
          </div>

          <p className="mt-5 text-ink-600 dark:text-ink-300 leading-relaxed line-clamp-4">{product.description}</p>

          {/* quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-ink-200 dark:border-white/10 overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 grid place-items-center hover:bg-ink-100 dark:hover:bg-white/5"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="h-11 w-11 grid place-items-center hover:bg-ink-100 dark:hover:bg-white/5"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={onAdd} disabled={product.stock === 0} className="btn-primary flex-1 min-w-[180px] py-3">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button onClick={onBuy} disabled={product.stock === 0} className="btn-accent flex-1 min-w-[180px] py-3">Buy Now</button>
            <button onClick={onWish} aria-label="Wishlist" className={`h-12 w-12 grid place-items-center rounded-xl border transition ${wished ? 'border-error-500 text-error-500 bg-error-500/10' : 'border-ink-200 dark:border-white/10 hover:border-error-500 hover:text-error-500'}`}>
              <Heart className={`w-5 h-5 ${wished ? 'fill-error-500' : ''}`} />
            </button>
          </div>

          {/* perks */}
          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            {[
              { icon: Truck, t: 'Free shipping', s: 'On orders over $75' },
              { icon: RefreshCw, t: '30-day returns', s: 'Hassle-free policy' },
              { icon: Shield, t: '2-year warranty', s: 'Full coverage' },
            ].map((p) => (
              <div key={p.t} className="glass-card p-3 flex items-center gap-3">
                <p.icon className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                <div><p className="text-sm font-semibold">{p.t}</p><p className="text-xs text-ink-500">{p.s}</p></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* tabs */}
      <div className="container-app">
        <div className="flex gap-2 border-b border-ink-200 dark:border-white/10">
          {(['desc', 'reviews'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 font-semibold text-sm border-b-2 -mb-px transition ${tab === t ? 'border-primary-600 text-primary-600 dark:text-primary-300' : 'border-transparent text-ink-500 hover:text-ink-800 dark:hover:text-white'}`}>
              {t === 'desc' ? 'Description' : `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>
        <div className="py-6">
          {tab === 'desc' ? (
            <div className="prose max-w-none text-ink-700 dark:text-ink-200 leading-relaxed">
              <p>{product.description}</p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2">
                {(product.tags ?? []).map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success-500" /> {t}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
              <div className="space-y-4">
                {reviews.length === 0 && <p className="text-ink-500">No reviews yet. Be the first!</p>}
                {reviews.map((r) => (
                  <div key={r.id} className="glass-card p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center text-white font-semibold">
                        {(r.author_name ?? 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.author_name ?? 'Anonymous'}</p>
                        <p className="text-xs text-ink-500">{formatDate(r.created_at)}</p>
                      </div>
                      <div className="ml-auto"><Rating value={r.rating} size={14} /></div>
                    </div>
                    <p className="mt-3 text-ink-700 dark:text-ink-200">{r.comment}</p>
                  </div>
                ))}
              </div>

              {/* review form */}
              <form onSubmit={submitReview} className="glass-card p-5 h-fit sticky top-32">
                <h3 className="font-display font-bold text-lg">Write a review</h3>
                <div className="mt-4">
                  <label className="text-sm font-medium">Your rating</label>
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button type="button" key={i} onClick={() => setRRating(i)}>
                        <Star className={`w-7 h-7 ${i <= rRating ? 'fill-accent-400 text-accent-400' : 'text-ink-300 dark:text-ink-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium">Your review</label>
                  <textarea value={rComment} onChange={(e) => setRComment(e.target.value)} rows={4} required className="input mt-1.5 resize-none" placeholder="Share your experience…" />
                </div>
                <button disabled={submitting} className="btn-primary w-full mt-4 py-3">Submit review</button>
                {!user && <p className="mt-2 text-xs text-ink-500 text-center">You need to be signed in to review.</p>}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="container-app mt-10">
          <h2 className="section-title mb-5">Related products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
