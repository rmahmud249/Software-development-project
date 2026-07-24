import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Package, Save, X } from 'lucide-react';
import { fetchBrands, fetchCategories, fetchProducts, type Brand, type Category, type Product } from '../../services/api';
import { formatPrice } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import { supabase, TABLES } from '../../services/supabaseClient';

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  price: 0,
  sale_price: '',
  stock: 0,
  rating: 4.5,
  review_count: 0,
  category_id: '',
  brand_id: '',
  images: '',
  is_featured: false,
  is_flash_sale: false,
  is_new: false,
  is_best_seller: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const { toast } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await fetchProducts({ pageSize: 200 });
      setItems(result.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    fetchCategories().then(setCategories).catch(() => toast('Could not load categories', 'error'));
    fetchBrands().then(setBrands).catch(() => toast('Could not load brands', 'error'));
  }, []);

  const filtered = items.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  const totals = useMemo(() => ({
    total: items.length,
    featured: items.filter((p) => p.is_featured).length,
    flash: items.filter((p) => p.is_flash_sale).length,
    outOfStock: items.filter((p) => p.stock === 0).length,
  }), [items]);

  const openNewProduct = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditing(product);
    setForm({
      title: product.title,
      slug: product.slug,
      description: product.description ?? '',
      price: product.price,
      sale_price: product.sale_price ?? '',
      stock: product.stock,
      rating: product.rating,
      review_count: product.review_count,
      category_id: product.category_id ?? '',
      brand_id: product.brand_id ?? '',
      images: (product.images ?? []).join(', '),
      is_featured: product.is_featured,
      is_flash_sale: product.is_flash_sale,
      is_new: product.is_new,
      is_best_seller: product.is_best_seller,
    });
    setModalOpen(true);
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    const record = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description || null,
      price: Number(form.price),
      sale_price: form.sale_price === '' ? null : Number(form.sale_price),
      stock: Number(form.stock),
      rating: Number(form.rating),
      review_count: Number(form.review_count),
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      images: form.images.split(',').map((item) => item.trim()).filter(Boolean),
      tags: [],
      is_featured: form.is_featured,
      is_flash_sale: form.is_flash_sale,
      is_new: form.is_new,
      is_best_seller: form.is_best_seller,
      flash_sale_end: form.is_flash_sale ? new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() : null,
      created_at: editing?.created_at ?? new Date().toISOString(),
    };

    try {
      if (editing) {
        const { data, error } = await supabase.from(TABLES.products).update(record).eq('id', editing.id).single();
        if (error) throw error;
        toast('Product updated successfully', 'success');
      } else {
        const { data, error } = await supabase.from(TABLES.products).insert({ ...record, id: `prod-${crypto.randomUUID()}` }).single();
        if (error) throw error;
        toast('Product added successfully', 'success');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err: any) {
      toast(err?.message ?? 'Could not save product', 'error');
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.title}?`)) return;
    try {
      const { error } = await supabase.from(TABLES.products).delete().eq('id', product.id);
      if (error) throw error;
      toast('Product deleted', 'success');
      loadProducts();
    } catch (err: any) {
      toast(err?.message ?? 'Could not delete product', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl">Product management</h1>
          <p className="text-ink-500 text-sm">{totals.total} products</p>
        </div>
        <button onClick={openNewProduct} className="btn-primary py-2"><Plus className="w-4 h-4" /> Add product</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total products', value: totals.total },
          { label: 'Featured', value: totals.featured },
          { label: 'Flash sale', value: totals.flash },
          { label: 'Out of stock', value: totals.outOfStock },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs text-ink-500">{s.label}</p>
            <p className="font-display font-bold text-2xl mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-ink-100 dark:border-white/10">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="p-10 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-500 border-b border-ink-100 dark:border-white/10">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-ink-100/60 dark:border-white/5 hover:bg-ink-50/50 dark:hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{p.title}</p>
                          <p className="text-xs text-ink-500">{p.brand?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{p.category?.name ?? '—'}</td>
                    <td className="p-4">
                      <span className="font-semibold">{formatPrice(p.sale_price ?? p.price)}</span>
                      {p.sale_price != null && <span className="block text-xs text-ink-400 line-through">{formatPrice(p.price)}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`chip ${p.stock === 0 ? 'text-error-500' : p.stock < 10 ? 'text-warning-600' : 'text-success-600'}`}>{p.stock}</span>
                    </td>
                    <td className="p-4">{Number(p.rating).toFixed(1)} ({p.review_count})</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditProduct(p)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-white/5"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteProduct(p)} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-error-500/10 text-error-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-10 text-center text-ink-500">
                <Package className="w-8 h-8 mx-auto mb-2" />
                No products found.
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/40 p-4">
          <div className="glass-card w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-100/10 p-5">
              <div>
                <h2 className="font-display font-bold text-xl">{editing ? 'Edit product' : 'Add product'}</h2>
                <p className="text-sm text-ink-500">Manage a product entry in the local catalog.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="h-10 w-10 grid place-items-center rounded-full hover:bg-ink-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveProduct} className="p-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 grid gap-3">
                <label className="text-sm font-medium">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input" />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="input" />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required className="input" />
              </div>
              <div>
                <label className="text-sm font-medium">Sale price</label>
                <input type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder="Optional" className="input" />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required className="input" />
              </div>
              <div>
                <label className="text-sm font-medium">Rating</label>
                <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium">Review count</label>
                <input type="number" value={form.review_count} onChange={(e) => setForm({ ...form, review_count: Number(e.target.value) })} className="input" />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                  <option value="">Select category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Brand</label>
                <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="input">
                  <option value="">Select brand</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Image URLs</label>
                <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="Comma separated URLs" className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[120px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_flash_sale} onChange={(e) => setForm({ ...form, is_flash_sale: e.target.checked })} /> Flash sale</label>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} /> New arrival</label>
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_best_seller} onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })} /> Best seller</label>
              </div>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-2 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                <button className="btn-primary inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
