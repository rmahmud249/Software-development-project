/*
# Nimbus eCommerce — Core Schema

## Purpose
Creates the catalog (categories, brands, products, reviews, coupons) and
user-owned data (addresses, orders, order_items, wishlists, carts, cart_items)
for the Nimbus marketplace. Public catalog is readable by anon; user-owned
data is owner-scoped via auth.uid().

## New Tables
1. categories — product categories (id, slug, name, description, image_url, parent_id, created_at)
2. brands — product brands (id, slug, name, logo_url, country, created_at)
3. products — sellable items (id, slug, title, description, price, sale_price, stock, rating, review_count, category_id, brand_id, images jsonb, tags text[], is_featured, is_flash_sale, is_new, is_best_seller, flash_sale_end timestamptz, created_at)
4. reviews — product reviews (id, product_id, user_id, author_name, rating 1-5, comment, created_at)
5. coupons — discount codes (id, code, type, value, min_order, max_discount, expires_at, active, usage_limit, used_count)
6. addresses — user shipping addresses (id, user_id, full_name, phone, line1, line2, city, state, postal_code, country, is_default, created_at)
7. orders — placed orders (id, user_id, order_number, status, subtotal, discount, shipping, total, coupon_code, shipping_address jsonb, payment_method, created_at, updated_at)
8. order_items — line items (id, order_id, product_id, title, image_url, price, quantity)
9. wishlists — saved products (id, user_id, product_id, created_at)
10. carts — per-user cart (id, user_id, coupon_code, created_at)
11. cart_items — cart lines (id, cart_id, product_id, quantity, created_at)

## Security
- RLS enabled on every table.
- Catalog tables (categories, brands, products, coupons, reviews SELECT) are
  publicly readable (anon + authenticated) so the storefront works without login.
- Reviews INSERT/UPDATE/DELETE scoped to the author.
- Coupons SELECT public; INSERT/UPDATE/DELETE admin-only via service role (no anon policy).
- User-owned tables (addresses, orders, order_items, wishlists, carts, cart_items)
  are owner-scoped with auth.uid() predicates and DEFAULT auth.uid() on owner columns.
- Catalog write operations (products, categories, brands) are admin-only — no anon
  INSERT/UPDATE/DELETE policy is created, so only the service role can mutate them
  (used by the admin panel via a future edge function or service-role path).

## Notes
1. owner columns default to auth.uid() so client inserts omitting user_id succeed.
2. order_items scoped via parent orders ownership check.
3. cart_items scoped via parent carts ownership check.
4. Unique constraints prevent duplicate wishlist entries and duplicate carts per user.
*/

-- Extensions
create extension if not exists pgcrypto;

-- ---------- categories ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  parent_id uuid references categories(id) on delete set null,
  created_at timestamptz default now()
);
alter table categories enable row level security;
drop policy if exists "public_read_categories" on categories;
create policy "public_read_categories" on categories for select to anon, authenticated using (true);

-- ---------- brands ----------
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  country text,
  created_at timestamptz default now()
);
alter table brands enable row level security;
drop policy if exists "public_read_brands" on brands;
create policy "public_read_brands" on brands for select to anon, authenticated using (true);

-- ---------- products ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  category_id uuid references categories(id) on delete set null,
  brand_id uuid references brands(id) on delete set null,
  images jsonb not null default '[]'::jsonb,
  tags text[] default '{}',
  is_featured boolean default false,
  is_flash_sale boolean default false,
  is_new boolean default false,
  is_best_seller boolean default false,
  flash_sale_end timestamptz,
  created_at timestamptz default now()
);
alter table products enable row level security;
drop policy if exists "public_read_products" on products;
create policy "public_read_products" on products for select to anon, authenticated using (true);
create index if not exists products_category_idx on products(category_id);
create index if not exists products_brand_idx on products(brand_id);
create index if not exists products_featured_idx on products(is_featured);
create index if not exists products_flash_idx on products(is_flash_sale);
create index if not exists products_created_at_idx on products(created_at desc);

-- ---------- reviews ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);
alter table reviews enable row level security;
drop policy if exists "public_read_reviews" on reviews;
create policy "public_read_reviews" on reviews for select to anon, authenticated using (true);
drop policy if exists "author_insert_review" on reviews;
create policy "author_insert_review" on reviews for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "author_update_review" on reviews;
create policy "author_update_review" on reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "author_delete_review" on reviews;
create policy "author_delete_review" on reviews for delete to authenticated using (auth.uid() = user_id);
create index if not exists reviews_product_idx on reviews(product_id);

-- ---------- coupons ----------
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percent','fixed')),
  value numeric(12,2) not null check (value >= 0),
  min_order numeric(12,2) default 0,
  max_discount numeric(12,2),
  expires_at timestamptz,
  active boolean default true,
  usage_limit integer,
  used_count integer default 0,
  created_at timestamptz default now()
);
alter table coupons enable row level security;
drop policy if exists "public_read_coupons" on coupons;
create policy "public_read_coupons" on coupons for select to anon, authenticated using (active = true);

-- ---------- addresses ----------
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null default 'United States',
  is_default boolean default false,
  created_at timestamptz default now()
);
alter table addresses enable row level security;
drop policy if exists "owner_select_addresses" on addresses;
create policy "owner_select_addresses" on addresses for select to authenticated using (auth.uid() = user_id);
drop policy if exists "owner_insert_addresses" on addresses;
create policy "owner_insert_addresses" on addresses for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "owner_update_addresses" on addresses;
create policy "owner_update_addresses" on addresses for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owner_delete_addresses" on addresses;
create policy "owner_delete_addresses" on addresses for delete to authenticated using (auth.uid() = user_id);

-- ---------- orders ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  order_number text unique not null default ('NIM-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,8))),
  status text not null default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled','refunded')),
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  coupon_code text,
  shipping_address jsonb,
  payment_method text default 'card',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table orders enable row level security;
drop policy if exists "owner_select_orders" on orders;
create policy "owner_select_orders" on orders for select to authenticated using (auth.uid() = user_id);
drop policy if exists "owner_insert_orders" on orders;
create policy "owner_insert_orders" on orders for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "owner_update_orders" on orders;
create policy "owner_update_orders" on orders for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_created_idx on orders(created_at desc);

-- ---------- order_items ----------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  title text not null,
  image_url text,
  price numeric(12,2) not null,
  quantity integer not null default 1
);
alter table order_items enable row level security;
drop policy if exists "owner_select_order_items" on order_items;
create policy "owner_select_order_items" on order_items for select to authenticated
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
drop policy if exists "owner_insert_order_items" on order_items;
create policy "owner_insert_order_items" on order_items for insert to authenticated
  with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- ---------- wishlists ----------
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);
alter table wishlists enable row level security;
drop policy if exists "owner_select_wishlists" on wishlists;
create policy "owner_select_wishlists" on wishlists for select to authenticated using (auth.uid() = user_id);
drop policy if exists "owner_insert_wishlists" on wishlists;
create policy "owner_insert_wishlists" on wishlists for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "owner_delete_wishlists" on wishlists;
create policy "owner_delete_wishlists" on wishlists for delete to authenticated using (auth.uid() = user_id);

-- ---------- carts ----------
create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  coupon_code text,
  created_at timestamptz default now(),
  unique (user_id)
);
alter table carts enable row level security;
drop policy if exists "owner_select_carts" on carts;
create policy "owner_select_carts" on carts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "owner_insert_carts" on carts;
create policy "owner_insert_carts" on carts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "owner_update_carts" on carts;
create policy "owner_update_carts" on carts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owner_delete_carts" on carts;
create policy "owner_delete_carts" on carts for delete to authenticated using (auth.uid() = user_id);

-- ---------- cart_items ----------
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique (cart_id, product_id)
);
alter table cart_items enable row level security;
drop policy if exists "owner_select_cart_items" on cart_items;
create policy "owner_select_cart_items" on cart_items for select to authenticated
  using (exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()));
drop policy if exists "owner_insert_cart_items" on cart_items;
create policy "owner_insert_cart_items" on cart_items for insert to authenticated
  with check (exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()));
drop policy if exists "owner_update_cart_items" on cart_items;
create policy "owner_update_cart_items" on cart_items for update to authenticated
  using (exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()))
  with check (exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()));
drop policy if exists "owner_delete_cart_items" on cart_items;
create policy "owner_delete_cart_items" on cart_items for delete to authenticated
  using (exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()));
