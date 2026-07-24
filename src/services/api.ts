import { supabase, TABLES } from './supabaseClient';

/** Normalized product shape used across the UI. */
export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  rating: number;
  review_count: number;
  category_id: string | null;
  brand_id: string | null;
  images: string[];
  tags: string[];
  is_featured: boolean;
  is_flash_sale: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  flash_sale_end: string | null;
  created_at: string;
  category?: { id: string; name: string; slug: string } | null;
  brand?: { id: string; name: string; slug: string } | null;
}

export interface Category {
  id: string; slug: string; name: string; description: string | null; image_url: string | null;
}
export interface Brand {
  id: string; slug: string; name: string; logo_url: string | null; country: string | null;
}
export interface Review {
  id: string; product_id: string; user_id: string | null; author_name: string | null;
  rating: number; comment: string | null; created_at: string;
}
export interface Coupon {
  id: string; code: string; type: 'percent' | 'fixed'; value: number;
  min_order: number; max_discount: number | null; expires_at: string | null; active: boolean;
}

function mapProduct(p: any): Product {
  return {
    ...p,
    images: Array.isArray(p.images) ? p.images : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
    sale_price: p.sale_price ?? null,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from(TABLES.categories).select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from(TABLES.brands).select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export interface ProductQuery {
  search?: string;
  category?: string;       // category slug
  brand?: string;          // brand slug
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
  page?: number;
  pageSize?: number;
  onlyFeatured?: boolean;
  onlyFlashSale?: boolean;
  onlyNew?: boolean;
  onlyBestSeller?: boolean;
}

export async function fetchProducts(q: ProductQuery = {}): Promise<{ items: Product[]; total: number }> {
  let query = supabase.from(TABLES.products).select('*, category:categories(id,name,slug), brand:brands(id,name,slug)', { count: 'exact' });

  if (q.onlyFeatured) query = query.eq('is_featured', true);
  if (q.onlyFlashSale) query = query.eq('is_flash_sale', true);
  if (q.onlyNew) query = query.eq('is_new', true);
  if (q.onlyBestSeller) query = query.eq('is_best_seller', true);

  if (q.search) query = query.or(`title.ilike.%${q.search}%,description.ilike.%${q.search}%`);
  if (q.minPrice != null) query = query.gte('price', q.minPrice);
  if (q.maxPrice != null) query = query.lte('price', q.maxPrice);
  if (q.minRating != null) query = query.gte('rating', q.minRating);

  // category + brand filtering via join columns
  if (q.category) {
    const { data: cat } = await supabase.from(TABLES.categories).select('id').eq('slug', q.category).maybeSingle();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (q.brand) {
    const { data: br } = await supabase.from(TABLES.brands).select('id').eq('slug', q.brand).maybeSingle();
    if (br) query = query.eq('brand_id', br.id);
  }

  switch (q.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    case 'popular': query = query.order('review_count', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const page = Math.max(1, q.page ?? 1);
  const pageSize = q.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { items: (data ?? []).map(mapProduct), total: count ?? 0 };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from(TABLES.products)
    .select('*, category:categories(id,name,slug), brand:brands(id,name,slug)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function fetchRelatedProducts(categoryId: string | null, excludeId: string, limit = 4): Promise<Product[]> {
  let query = supabase
    .from(TABLES.products)
    .select('*, category:categories(id,name,slug), brand:brands(id,name,slug)')
    .neq('id', excludeId)
    .limit(limit);
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from(TABLES.reviews)
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addReview(input: { product_id: string; rating: number; comment: string; author_name?: string }): Promise<Review> {
  const { data, error } = await supabase
    .from(TABLES.reviews)
    .insert({
      product_id: input.product_id,
      rating: input.rating,
      comment: input.comment,
      author_name: input.author_name ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discount: number } | null> {
  const { data, error } = await supabase
    .from(TABLES.coupons)
    .select('*')
    .eq('code', code)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const coupon = data as Coupon;
  if (coupon.min_order && subtotal < Number(coupon.min_order)) return null;
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return null;
  let discount = coupon.type === 'percent'
    ? (subtotal * Number(coupon.value)) / 100
    : Number(coupon.value);
  if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
  discount = Math.min(discount, subtotal);
  return { coupon, discount };
}
