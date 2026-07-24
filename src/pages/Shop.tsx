import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { fetchBrands, fetchCategories, fetchProducts, type Brand, type Category, type Product } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { formatPrice } from '../utils/format';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
] as const;

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [cats, setCats] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = params.get('search') ?? '';
  const category = params.get('category') ?? '';
  const brand = params.get('brand') ?? '';
  const minPrice = params.get('min') ? Number(params.get('min')) : undefined;
  const maxPrice = params.get('max') ? Number(params.get('max')) : undefined;
  const minRating = params.get('rating') ? Number(params.get('rating')) : undefined;
  const sort = (params.get('sort') as any) ?? 'newest';
  const page = Number(params.get('page') ?? '1');
  const flash = params.get('flash') === '1';
  const fresh = params.get('new') === '1';
  const best = params.get('best') === '1';

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    Promise.all([fetchCategories(), fetchBrands()]).then(([c, b]) => { setCats(c); setBrands(b); });
  }, []);

  useEffect(() => {
    let m = true;
    setLoading(true);
    fetchProducts({
      search: search || undefined, category: category || undefined, brand: brand || undefined,
      minPrice, maxPrice, minRating, sort, page, pageSize,
      onlyFlashSale: flash || undefined, onlyNew: fresh || undefined, onlyBestSeller: best || undefined,
    })
      .then((r) => { if (!m) return; setItems(r.items); setTotal(r.total); })
      .catch(() => { if (m) setItems([]); })
      .finally(() => { if (m) setLoading(false); });
    return () => { m = false; };
  }, [search, category, brand, minPrice, maxPrice, minRating, sort, page, flash, fresh, best]);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value == null || value === '') next.delete(key); else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const activeCount = useMemo(() => [category, brand, minPrice, maxPrice, minRating, search].filter(Boolean).length, [category, brand, minPrice, maxPrice, minRating, search]);

  return (
    <div className="container-app py-8">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl">
            {flash ? 'Flash Sale' : fresh ? 'New Arrivals' : best ? 'Best Sellers' : 'Shop all'}
          </h1>
          <p className="mt-1 text-ink-500">{loading ? 'Loading…' : `${total} products`}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              defaultValue={search}
              placeholder="Search…"
              onChange={(e) => update('search', e.target.value || null)}
              className="input pl-10 w-48 sm:w-64"
            />
          </div>
          <select value={sort} onChange={(e) => update('sort', e.target.value)} className="input w-auto">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setShowFilters((v) => !v)} className="btn-outline lg:hidden px-3">
            <SlidersHorizontal className="w-4 h-4" /> {activeCount > 0 && <span className="ml-1 text-xs bg-primary-600 text-white rounded-full px-1.5">{activeCount}</span>}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="glass-card p-5 sticky top-32 space-y-6 max-h-[calc(100vh-9rem)] overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold">Filters</h3>
              {activeCount > 0 && (
                <button onClick={() => setParams(new URLSearchParams(), { replace: true })} className="text-xs text-primary-600 hover:underline">Clear all</button>
              )}
            </div>

            <FilterGroup title="Category">
              <RadioOption label="All categories" checked={!category} onChange={() => update('category', null)} />
              {cats.map((c) => (
                <RadioOption key={c.id} label={c.name} checked={category === c.slug} onChange={() => update('category', c.slug)} />
              ))}
            </FilterGroup>

            <FilterGroup title="Brand">
              <RadioOption label="All brands" checked={!brand} onChange={() => update('brand', null)} />
              {brands.map((b) => (
                <RadioOption key={b.id} label={b.name} checked={brand === b.slug} onChange={() => update('brand', b.slug)} />
              ))}
            </FilterGroup>

            <FilterGroup title="Price">
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" defaultValue={minPrice} onBlur={(e) => update('min', e.target.value || null)} className="input py-2" />
                <span className="text-ink-400">—</span>
                <input type="number" placeholder="Max" defaultValue={maxPrice} onBlur={(e) => update('max', e.target.value || null)} className="input py-2" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {[0, 50, 100, 250].map((m, i) => (
                  <button key={i} onClick={() => { update('min', String(m)); update('max', String([50, 100, 250, 9999][i])); }} className="text-xs px-2 py-1.5 rounded-lg bg-ink-50 dark:bg-white/5 hover:bg-ink-100 dark:hover:bg-white/10">
                    {m === 0 ? 'All' : `$${m}–$${[50, 100, 250, 9999][i] === 9999 ? '9999+' : [50, 100, 250, 9999][i]}`}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Rating">
              {[4, 3, 2, 1].map((r) => (
                <button key={r} onClick={() => update('rating', minRating === r ? '' : String(r))} className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition ${minRating === r ? 'bg-primary-50 dark:bg-white/10 text-primary-700 dark:text-primary-300' : 'hover:bg-ink-50 dark:hover:bg-white/5'}`}>
                  <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r ? 'fill-accent-400 text-accent-400' : 'text-ink-200 dark:text-ink-700'}`} />)}</span>
                  <span>& up</span>
                </button>
              ))}
            </FilterGroup>
          </div>
        </aside>

        {/* grid */}
        <div>
          {loading ? <ProductGridSkeleton count={8} /> : items.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-ink-500">No products match your filters.</p>
              <button onClick={() => setParams(new URLSearchParams(), { replace: true })} className="btn-primary mt-4">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
              {/* pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button disabled={page <= 1} onClick={() => update('page', String(page - 1))} className="btn-outline px-3 py-2 disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => update('page', String(p))} className={`h-10 w-10 rounded-xl font-semibold text-sm transition ${p === page ? 'bg-primary-600 text-white' : 'btn-outline'}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button disabled={page >= totalPages} onClick={() => update('page', String(page + 1))} className="btn-outline px-3 py-2 disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold text-sm uppercase tracking-wider text-ink-500 mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function RadioOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-left transition hover:bg-ink-50 dark:hover:bg-white/5">
      <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${checked ? 'border-primary-600' : 'border-ink-300 dark:border-ink-600'}`}>
        {checked && <span className="h-2 w-2 rounded-full bg-primary-600" />}
      </span>
      <span className={checked ? 'text-primary-700 dark:text-primary-300 font-medium' : ''}>{label}</span>
    </button>
  );
}
