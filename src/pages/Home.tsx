import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, Flame, Sparkles, TrendingUp, Star, Quote, Mail, ChevronRight, Clock,
} from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

import { fetchCategories, fetchProducts, type Product, type Category } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import { timeLeft } from '../utils/format';

const slides = [
  {
    title: 'Sound that moves you',
    sub: 'Up to 30% off premium audio gear',
    cta: 'Shop audio',
    href: '/shop?category=electronics',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    title: 'Fresh season, fresh style',
    sub: 'New arrivals in fashion & footwear',
    cta: 'Explore fashion',
    href: '/shop?category=fashion',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
  {
    title: 'Make every space feel like home',
    sub: 'Curated home & living essentials',
    cta: 'Discover home',
    href: '/shop?category=home',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600',
  },
];

const reviews = [
  { name: 'Maya L.', role: 'Verified buyer', rating: 5, text: 'Checkout was seamless and delivery was two days early. The packaging felt premium — I will be back.' },
  { name: 'Daniel R.', role: 'Verified buyer', rating: 5, text: 'The product filter and search are the best I have used on any store. Found exactly what I needed in seconds.' },
  { name: 'Priya N.', role: 'Verified buyer', rating: 4, text: 'Great prices and the flash sale timer made it fun. Wishlist sync across devices is a nice touch.' },
];

export default function Home() {
  const [cats, setCats] = useState<Category[]>([]);
  const [flash, setFlash] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [fresh, setFresh] = useState<Product[]>([]);
  const [best, setBest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [c, f, feat, n, b] = await Promise.all([
          fetchCategories(),
          fetchProducts({ onlyFlashSale: true, pageSize: 8 }),
          fetchProducts({ onlyFeatured: true, pageSize: 8 }),
          fetchProducts({ onlyNew: true, pageSize: 8 }),
          fetchProducts({ onlyBestSeller: true, pageSize: 8 }),
        ]);
        setCats(c);
        setFlash(f.items);
        setFeatured(feat.items);
        setFresh(n.items);
        setBest(b.items);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        toast('Could not load products', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  return (
    <div>
      {/* HERO */}
      <section className="container-app pt-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="relative rounded-3xl overflow-hidden h-[420px] sm:h-[480px] shadow-card">
            <Swiper
              modules={[Autoplay, Pagination, Navigation, EffectFade]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              effect="fade"
              loop
              className="h-full"
            >
              {slides.map((s, i) => (
                <SwiperSlide key={i}>
                  <div className="relative h-full">
                    <img src={s.image} alt={s.title} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/40 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-8 sm:p-12 max-w-xl">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="chip bg-white/15 text-white mb-4"><Sparkles className="w-3.5 h-3.5" /> Featured collection</span>
                        <h2 className="font-display font-bold text-3xl sm:text-5xl text-white leading-tight text-balance">{s.title}</h2>
                        <p className="mt-3 text-white/80 text-lg">{s.sub}</p>
                        <Link to={s.href} className="btn-accent mt-6 group">
                          {s.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* side promos */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <PromoCard
              title="Flash Sale"
              sub="Limited-time deals"
              icon={Zap}
              accent="from-accent-500 to-error-500"
              href="/shop?flash=1"
            />
            <PromoCard
              title="New Arrivals"
              sub="Just landed"
              icon={Sparkles}
              accent="from-primary-600 to-primary-400"
              href="/shop?new=1"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <Section title="Shop by category" subtitle="Browse curated departments" link="/shop">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {cats.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Link to={`/shop?category=${c.slug}`} className="group block glass-card overflow-hidden card-hover">
                  <div className="aspect-square overflow-hidden bg-ink-100 dark:bg-ink-800">
                    <img src={c.image_url ?? ''} alt={c.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-semibold text-sm text-ink-900 dark:text-white">{c.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* FLASH SALE */}
      {flash.length > 0 && (
        <Section title="Flash sale" subtitle="Hurry — deals end soon" icon={Flame} accent="text-error-500" link="/shop?flash=1">
          <FlashTimer products={flash} />
          <ProductGrid products={flash} loading={loading} />
        </Section>
      )}

      {/* FEATURED */}
      <Section title="Featured products" subtitle="Handpicked favorites" icon={Star} accent="text-accent-500" link="/shop">
        <ProductGrid products={featured} loading={loading} />
      </Section>

      {/* DISCOUNT BANNER */}
      <section className="container-app">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500 text-white p-8 sm:p-12">
          <div className="absolute inset-0 bg-grid-dark [background-size:32px_32px] opacity-20" />
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="chip bg-white/15 text-white mb-3"><TrendingUp className="w-3.5 h-3.5" /> Limited offer</span>
              <h3 className="font-display font-bold text-3xl sm:text-4xl">Get 20% off orders over $200</h3>
              <p className="mt-2 text-white/85">Use code <span className="font-semibold tracking-wide">NIMBUS20</span> at checkout. Ends soon.</p>
            </div>
            <Link to="/shop" className="btn bg-white text-primary-700 hover:bg-white/90 px-6 py-3 font-semibold">Shop now <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <Section title="New arrivals" subtitle="The latest drops" icon={Sparkles} accent="text-primary-500" link="/shop?new=1">
        <ProductGrid products={fresh} loading={loading} />
      </Section>

      {/* BEST SELLERS */}
      <Section title="Best sellers" subtitle="Customer favorites" icon={TrendingUp} accent="text-success-500" link="/shop?best=1">
        <ProductGrid products={best} loading={loading} />
      </Section>

      {/* BRANDS */}
      <Section title="Popular brands" subtitle="Trusted by shoppers" link="/shop">
        <div className="glass-card p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {['Nimbus','Aurora','Vertex','Lumen','Bloom','Apex','Kindred','Terra'].map((b) => (
            <div key={b} className="aspect-[3/2] grid place-items-center rounded-xl bg-ink-50 dark:bg-white/5 hover:bg-ink-100 dark:hover:bg-white/10 transition">
              <span className="font-display font-bold text-lg text-ink-700 dark:text-ink-200">{b}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* REVIEWS */}
      <Section title="Customer reviews" subtitle="What shoppers say">
        <div className="grid md:grid-cols-3 gap-4">
          {reviews.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-6">
              <Quote className="w-8 h-8 text-primary-500/40" />
              <p className="mt-3 text-ink-700 dark:text-ink-200 leading-relaxed">{r.text}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center text-white font-semibold">{r.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-sm text-ink-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-ink-500">{r.role}</p>
                </div>
                <div className="ml-auto flex">
                  {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="w-4 h-4 fill-accent-400 text-accent-400" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* NEWSLETTER */}
      <section className="container-app">
        <div className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="relative">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 grid place-items-center text-white mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-2xl sm:text-3xl">Join the Nimbus newsletter</h3>
            <p className="mt-2 text-ink-500 dark:text-ink-400 max-w-md mx-auto">Be first to know about new drops, exclusive deals, and member-only offers.</p>
            <form onSubmit={(e) => { e.preventDefault(); toast('You are subscribed!', 'success'); }} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input type="email" required placeholder="you@email.com" className="input" />
              <button className="btn-primary justify-center">Subscribe <ArrowRight className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, subtitle, link, icon: Icon, accent, children }: {
  title: string; subtitle?: string; link?: string; icon?: any; accent?: string; children: React.ReactNode;
}) {
  return (
    <section className="container-app mt-14">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="section-title flex items-center gap-2">
            {Icon && <Icon className={`w-6 h-6 ${accent ?? ''}`} />}
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-ink-500 dark:text-ink-400">{subtitle}</p>}
        </div>
        {link && (
          <Link to={link} className="text-sm font-semibold text-primary-600 dark:text-primary-300 hover:underline flex items-center gap-1 shrink-0">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) return <ProductGridSkeleton count={4} />;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}

function PromoCard({ title, sub, icon: Icon, accent, href }: { title: string; sub: string; icon: any; accent: string; href: string }) {
  return (
    <Link to={href} className="group relative overflow-hidden rounded-3xl p-6 h-[200px] flex flex-col justify-between text-white">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="absolute inset-0 bg-grid-dark [background-size:24px_24px] opacity-20" />
      <Icon className="relative w-8 h-8" />
      <div className="relative">
        <p className="font-display font-bold text-xl">{title}</p>
        <p className="text-white/80 text-sm">{sub}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold">Shop now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" /></span>
      </div>
    </Link>
  );
}

function FlashTimer({ products }: { products: Product[] }) {
  const earliest = products.find((p) => p.flash_sale_end)?.flash_sale_end ?? null;
  const [t, setT] = useState(() => timeLeft(earliest));
  useEffect(() => {
    const id = setInterval(() => setT(timeLeft(earliest)), 1000);
    return () => clearInterval(id);
  }, [earliest]);
  return (
    <div className="flex items-center gap-2 mb-4 text-sm">
      <Clock className="w-4 h-4 text-error-500" />
      <span className="text-ink-600 dark:text-ink-300">Ends in</span>
      <div className="flex gap-1.5 font-mono font-semibold">
        <span className="px-2 py-1 rounded-md bg-ink-900 text-white text-xs">{String(t.h).padStart(2, '0')}</span>
        <span className="px-2 py-1 rounded-md bg-ink-900 text-white text-xs">{String(t.m).padStart(2, '0')}</span>
        <span className="px-2 py-1 rounded-md bg-error-500 text-white text-xs">{String(t.s).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
