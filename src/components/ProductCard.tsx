import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '../services/api';
import { formatPrice, discountPct } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const wished = has(product.id);
  const off = discountPct(product.price, product.sale_price);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    await add(product, 1);
    toast('Added to cart', 'success');
  };
  const onWish = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggle(product.id);
    toast(wished ? 'Removed from wishlist' : 'Saved to wishlist', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link to={`/product/${product.slug}`} className="group block glass-card overflow-hidden card-hover no-tap">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink-100 dark:bg-ink-800">
          <img
            src={product.images?.[0] ?? 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600'}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {off > 0 && <span className="rounded-full bg-error-500 text-white text-[11px] font-semibold px-2.5 py-1 shadow">-{off}%</span>}
            {product.is_new && <span className="rounded-full bg-primary-600 text-white text-[11px] font-semibold px-2.5 py-1 shadow">New</span>}
            {product.is_flash_sale && <span className="rounded-full bg-accent-500 text-white text-[11px] font-semibold px-2.5 py-1 shadow">Flash</span>}
          </div>
          {/* quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button onClick={onWish} aria-label="Toggle wishlist" className="h-9 w-9 grid place-items-center rounded-full glass text-ink-700 dark:text-white hover:text-error-500 transition">
              <Heart className={`w-4 h-4 ${wished ? 'fill-error-500 text-error-500' : ''}`} />
            </button>
            <span className="h-9 w-9 grid place-items-center rounded-full glass text-ink-700 dark:text-white">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          {/* add to cart bar */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={onAdd} className="btn-primary w-full text-sm py-2.5">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[11px] uppercase tracking-wider text-ink-400 dark:text-ink-500">{product.brand?.name ?? 'Nimbus'}</p>
          <h3 className="mt-1 font-semibold text-ink-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition">
            {product.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-ink-500 dark:text-ink-400">
            <Star className="w-3.5 h-3.5 fill-accent-400 text-accent-400" />
            <span className="font-medium text-ink-700 dark:text-ink-200">{product.rating.toFixed(1)}</span>
            <span>· {product.review_count} reviews</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-bold text-lg text-ink-900 dark:text-white">
              {formatPrice(product.sale_price ?? product.price)}
            </span>
            {product.sale_price != null && product.sale_price < product.price && (
              <span className="text-sm text-ink-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
