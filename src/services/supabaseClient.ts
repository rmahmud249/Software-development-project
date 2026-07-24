type Row = Record<string, any>;
type TableKey =
  | 'categories'
  | 'brands'
  | 'products'
  | 'reviews'
  | 'coupons'
  | 'addresses'
  | 'orders'
  | 'order_items'
  | 'wishlists'
  | 'carts'
  | 'cart_items'
  | 'users';

type SelectOptions = { count?: 'exact'; head?: boolean };

type AuthSession = {
  access_token: string;
  token_type: 'bearer';
  user: { id: string; email: string; user_metadata: Record<string, any> };
  expires_at: number | null;
};

type AuthState = { session: AuthSession | null };

const STORAGE_KEY = 'nimbus-local-db';
const AUTH_KEY = 'nimbus-local-auth';

const initialDatabase = {
  categories: [
    {
      id: 'cat-electronics',
      slug: 'electronics',
      name: 'Electronics',
      description: 'Premium audio, wearables, and smart home essentials.',
      image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
    {
      id: 'cat-fashion',
      slug: 'fashion',
      name: 'Fashion',
      description: 'Trend-forward apparel, accessories, and footwear.',
      image_url: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
    {
      id: 'cat-home',
      slug: 'home',
      name: 'Home',
      description: 'Stylish home décor, kitchen, and everyday comfort pieces.',
      image_url: 'https://images.pexels.com/photos/709155/pexels-photo-709155.jpeg?auto=compress&cs=tinysrgb&w=1200',
    },
  ],
  brands: [
    { id: 'brand-nimbus', slug: 'nimbus', name: 'Nimbus', logo_url: null, country: 'United States' },
    { id: 'brand-aurora', slug: 'aurora', name: 'Aurora', logo_url: null, country: 'Canada' },
    { id: 'brand-terra', slug: 'terra', name: 'Terra', logo_url: null, country: 'Germany' },
  ],
  products: [
    {
      id: 'prod-001',
      slug: 'nimbus-true-wireless-earbuds',
      title: 'Nimbus True Wireless Earbuds',
      description: 'Immersive sound with long battery life and seamless device pairing.',
      price: 139.99,
      sale_price: 99.99,
      stock: 42,
      rating: 4.8,
      review_count: 118,
      category_id: 'cat-electronics',
      brand_id: 'brand-nimbus',
      images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1200'],
      tags: ['audio', 'wireless', 'earbuds'],
      is_featured: true,
      is_flash_sale: true,
      is_new: false,
      is_best_seller: true,
      flash_sale_end: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      created_at: '2026-07-10T12:00:00.000Z',
    },
    {
      id: 'prod-002',
      slug: 'aurora-zen-smartwatch',
      title: 'Aurora Zen Smartwatch',
      description: 'Track fitness, receive alerts, and stay powered through any day.',
      price: 219.0,
      sale_price: null,
      stock: 28,
      rating: 4.5,
      review_count: 76,
      category_id: 'cat-electronics',
      brand_id: 'brand-aurora',
      images: ['https://images.pexels.com/photos/277406/pexels-photo-277406.jpeg?auto=compress&cs=tinysrgb&w=1200'],
      tags: ['wearable', 'smartwatch', 'fitness'],
      is_featured: true,
      is_flash_sale: false,
      is_new: true,
      is_best_seller: false,
      flash_sale_end: null,
      created_at: '2026-07-15T09:30:00.000Z',
    },
    {
      id: 'prod-003',
      slug: 'terra-cozy-throw-blanket',
      title: 'Terra Cozy Throw Blanket',
      description: 'Soft, breathable knit blanket for cozy evenings at home.',
      price: 68.0,
      sale_price: 54.4,
      stock: 93,
      rating: 4.7,
      review_count: 49,
      category_id: 'cat-home',
      brand_id: 'brand-terra',
      images: ['https://images.pexels.com/photos/14578455/pexels-photo-14578455.jpeg?auto=compress&cs=tinysrgb&w=1200'],
      tags: ['home', 'cozy', 'blanket'],
      is_featured: false,
      is_flash_sale: true,
      is_new: true,
      is_best_seller: false,
      flash_sale_end: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      created_at: '2026-07-17T11:15:00.000Z',
    },
    {
      id: 'prod-004',
      slug: 'nimbus-elevate-running-shoes',
      title: 'Nimbus Elevate Running Shoes',
      description: 'Lightweight support engineered for daily runs and active commutes.',
      price: 129.0,
      sale_price: 109.0,
      stock: 36,
      rating: 4.6,
      review_count: 87,
      category_id: 'cat-fashion',
      brand_id: 'brand-nimbus',
      images: ['https://images.pexels.com/photos/19090/pexels-photo-19090.jpeg?auto=compress&cs=tinysrgb&w=1200'],
      tags: ['running', 'shoes', 'fitness'],
      is_featured: true,
      is_flash_sale: false,
      is_new: false,
      is_best_seller: true,
      flash_sale_end: null,
      created_at: '2026-07-12T10:20:00.000Z',
    },
    {
      id: 'prod-005',
      slug: 'aurora-luxe-backpack',
      title: 'Aurora Luxe Backpack',
      description: 'Sleek carry-all for work and travel with padded laptop protection.',
      price: 94.99,
      sale_price: null,
      stock: 51,
      rating: 4.4,
      review_count: 64,
      category_id: 'cat-fashion',
      brand_id: 'brand-aurora',
      images: ['https://images.pexels.com/photos/4491425/pexels-photo-4491425.jpeg?auto=compress&cs=tinysrgb&w=1200'],
      tags: ['travel', 'bag', 'everyday'],
      is_featured: false,
      is_flash_sale: false,
      is_new: true,
      is_best_seller: false,
      flash_sale_end: null,
      created_at: '2026-07-18T13:45:00.000Z',
    },
    {
      id: 'prod-006',
      slug: 'terra-modern-table-lamp',
      title: 'Terra Modern Table Lamp',
      description: 'Warm ambient lighting with a polished matte finish.',
      price: 59.99,
      sale_price: 49.99,
      stock: 78,
      rating: 4.3,
      review_count: 32,
      category_id: 'cat-home',
      brand_id: 'brand-terra',
      images: ['https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg?auto=compress&cs=tinysrgb&w=1200'],
      tags: ['lighting', 'home', 'decor'],
      is_featured: false,
      is_flash_sale: false,
      is_new: false,
      is_best_seller: true,
      flash_sale_end: null,
      created_at: '2026-07-11T08:55:00.000Z',
    },
  ],
  reviews: [
    {
      id: 'rev-001',
      product_id: 'prod-001',
      user_id: null,
      author_name: 'Maya L.',
      rating: 5,
      comment: 'The battery life and fit are exactly what I needed. Great sound quality.',
      created_at: '2026-07-12T09:20:00.000Z',
    },
    {
      id: 'rev-002',
      product_id: 'prod-002',
      user_id: null,
      author_name: 'Daniel R.',
      rating: 4,
      comment: 'The interface is clean and the watch is comfortable for everyday wear.',
      created_at: '2026-07-13T11:35:00.000Z',
    },
  ],
  coupons: [
    {
      id: 'coupon-001',
      code: 'NIMBUS20',
      type: 'percent',
      value: 20,
      min_order: 50,
      max_discount: 100,
      expires_at: '2027-12-31T23:59:59.000Z',
      active: true,
    },
  ],
  addresses: [],
  orders: [],
  order_items: [],
  wishlists: [],
  carts: [],
  cart_items: [],
  users: [
    {
      id: 'user-demo',
      email: 'demo@nimbus.com',
      password: 'password',
      user_metadata: { full_name: 'Demo Shopper', phone: '555-123-4567', role: 'admin' },
      created_at: '2026-07-01T08:00:00.000Z',
    },
  ],
};

const db = loadDatabase();
const auth = loadAuthState();
const authSubscribers: Array<(event: string, session: AuthSession | null) => void> = [];

function parseStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function loadDatabase() {
  return parseStorage<Row>(STORAGE_KEY, initialDatabase) as typeof initialDatabase;
}

function loadAuthState(): AuthState {
  return parseStorage<AuthState>(AUTH_KEY, { session: null });
}

function saveDatabase() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function saveAuthState() {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

function buildSession(user: Row): AuthSession {
  return {
    access_token: `local-${user.id}`,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {},
    },
    expires_at: null,
  };
}

function findUserByEmail(email: string) {
  return db.users.find((row) => row.email.toLowerCase() === email.toLowerCase()) as Row | undefined;
}

function findUserById(id: string) {
  return db.users.find((row) => row.id === id) as Row | undefined;
}

function notifyAuthChange(event: string, session: AuthSession | null) {
  authSubscribers.forEach((subscriber) => subscriber(event, session));
}

function persistAuth(user: Row | null) {
  auth.session = user ? buildSession(user) : null;
  saveAuthState();
  notifyAuthChange(user ? 'SIGNED_IN' : 'SIGNED_OUT', auth.session);
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeValue(value: any) {
  if (typeof value === 'string' && !Number.isNaN(Number(value))) return Number(value);
  return value;
}

function matchesFilter(row: Row, filter: { type: string; field: string; value: any }) {
  const left = row[filter.field];
  const right = filter.value;

  if (filter.type === 'eq') return left === right;
  if (filter.type === 'neq') return left !== right;
  if (filter.type === 'in') return Array.isArray(right) && right.includes(left);

  const leftValue = normalizeValue(left);
  const rightValue = normalizeValue(right);
  if (filter.type === 'gte') return leftValue >= rightValue;
  if (filter.type === 'lte') return leftValue <= rightValue;
  if (filter.type === 'gt') return leftValue > rightValue;
  if (filter.type === 'lt') return leftValue < rightValue;
  return false;
}

function parseOrConditions(expression: string) {
  const parts = expression.split(',');
  return parts.map((part) => {
    const match = part.trim().match(/^([\w.]+)\.(\w+)\.(.+)$/);
    if (!match) return null;
    return { field: match[1], operator: match[2], pattern: match[3] };
  }).filter(Boolean) as Array<{ field: string; operator: string; pattern: string }>;
}

function matchesOr(row: Row, conditions: Array<{ field: string; operator: string; pattern: string }>) {
  return conditions.some((condition) => {
    const value = row[condition.field];
    if (typeof value !== 'string') return false;
    const normalized = value.toLowerCase();
    const pattern = condition.pattern.toLowerCase().replace(/%/g, '');

    if (condition.operator === 'ilike') {
      return normalized.includes(pattern);
    }
    return false;
  });
}

function pickFields(row: Row, fields: string[]) {
  if (fields.includes('*')) return { ...row };
  const result: Row = {};
  fields.forEach((field) => {
    if (field in row) result[field] = row[field];
  });
  return result;
}

function resolveJoin(row: Row, alias: string, table: TableKey, fields: string[]) {
  const source = db[table] as Row[];
  if (alias === 'items' && table === 'order_items') {
    return source
      .filter((item) => item.order_id === row.id)
      .map((item) => pickFields(item, fields));
  }

  const foreignKey = `${alias}_id`;
  if (foreignKey in row) {
    const target = source.find((item) => item.id === row[foreignKey]);
    return target ? pickFields(target, fields) : null;
  }

  if (alias === 'product' && row.product_id) {
    const target = source.find((item) => item.id === row.product_id);
    return target ? pickFields(target, fields) : null;
  }

  if (alias === 'category' && row.category_id) {
    const target = source.find((item) => item.id === row.category_id);
    return target ? pickFields(target, fields) : null;
  }

  if (alias === 'brand' && row.brand_id) {
    const target = source.find((item) => item.id === row.brand_id);
    return target ? pickFields(target, fields) : null;
  }

  return null;
}

function parseSelectFields(selectString: string) {
  const fields: string[] = [];
  let buffer = '';
  let depth = 0;

  for (const char of selectString) {
    if (char === ',' && depth === 0) {
      if (buffer.trim()) fields.push(buffer.trim());
      buffer = '';
      continue;
    }
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    buffer += char;
  }

  if (buffer.trim()) fields.push(buffer.trim());
  return fields;
}

function applySelect(row: Row, selectString: string) {
  const fields = parseSelectFields(selectString || '*');
  const result: Row = {};
  const joinItems: Array<{ alias: string; table: string; fields: string[] }> = [];

  fields.forEach((field) => {
    const aliasMatch = field.match(/^([\w]+):([\w]+)\((.*)\)$/);
    if (aliasMatch) {
      joinItems.push({
        alias: aliasMatch[1],
        table: aliasMatch[2] as TableKey,
        fields: aliasMatch[3].split(',').map((f) => f.trim()),
      });
      return;
    }

    if (field === '*') {
      Object.assign(result, row);
      return;
    }

    if (field in row) {
      result[field] = row[field];
    }
  });

  joinItems.forEach(({ alias, table, fields: joinFields }) => {
    result[alias] = resolveJoin(row, alias, table, joinFields);
  });

  return result;
}
class LocalQuery {
  table: TableKey;
  filters: Array<{ type: string; field: string; value: any }> = [];
  orConditions: Array<{ field: string; operator: string; pattern: string }> = [];
  orderSpec: { field: string; ascending: boolean } | null = null;
  limitCount: number | null = null;
  rangeBounds: [number, number] | null = null;
  insertRows: Row[] | null = null;
  updateValues: Row | null = null;
  deleteFlag = false;
  selectString = '*';
  countExact = false;
  head = false;
  returnSingle: 'single' | 'maybeSingle' | null = null;

  constructor(table: TableKey) {
    this.table = table;
  }

  select(selectString = '*', options?: SelectOptions) {
    this.selectString = selectString;
    this.countExact = options?.count === 'exact';
    this.head = options?.head ?? false;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push({ type: 'neq', field, value });
    return this;
  }

  gt(field: string, value: any) {
    this.filters.push({ type: 'gt', field, value });
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push({ type: 'gte', field, value });
    return this;
  }

  lt(field: string, value: any) {
    this.filters.push({ type: 'lt', field, value });
    return this;
  }

  lte(field: string, value: any) {
    this.filters.push({ type: 'lte', field, value });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({ type: 'in', field, value: values });
    return this;
  }

  or(expression: string) {
    this.orConditions = parseOrConditions(expression);
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderSpec = { field, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeBounds = [from, to];
    return this;
  }

  insert(rows: Row | Row[]) {
    this.insertRows = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(values: Row) {
    this.updateValues = values;
    return this;
  }

  delete() {
    this.deleteFlag = true;
    return this;
  }

  maybeSingle() {
    this.returnSingle = 'maybeSingle';
    return this;
  }

  single() {
    this.returnSingle = 'single';
    return this;
  }

  async execute() {
    const tableData = db[this.table] as Row[];
    let rows = tableData.slice();

    if (this.filters.length > 0) {
      rows = rows.filter((row) => this.filters.every((filter) => matchesFilter(row, filter)));
    }

    if (this.orConditions.length > 0) {
      rows = rows.filter((row) => matchesOr(row, this.orConditions));
    }

    const count = rows.length;

    if (this.orderSpec) {
      rows.sort((a, b) => {
        const left = a[this.orderSpec!.field];
        const right = b[this.orderSpec!.field];
        if (left === right) return 0;
        if (left == null) return 1;
        if (right == null) return -1;
        if (typeof left === 'string' && typeof right === 'string') {
          return this.orderSpec!.ascending ? left.localeCompare(right) : right.localeCompare(left);
        }
        return this.orderSpec!.ascending ? (left > right ? 1 : -1) : (left > right ? -1 : 1);
      });
    }

    if (this.rangeBounds) {
      rows = rows.slice(this.rangeBounds[0], this.rangeBounds[1] + 1);
    } else if (this.limitCount != null) {
      rows = rows.slice(0, this.limitCount);
    }

    if (this.insertRows) {
      const inserted = this.insertRows.map((row) => {
        const record = { ...row, id: row.id ?? createId(this.table), created_at: row.created_at ?? new Date().toISOString() };
        db[this.table].push(record);
        return record;
      });
      saveDatabase();
      return {
        data: inserted.map((record) => applySelect(record, this.selectString)),
        error: null,
        count: this.countExact ? inserted.length : undefined,
      };
    }

    if (this.updateValues) {
      const updated: Row[] = [];
      rows.forEach((row) => {
        const original = tableData.find((item) => item.id === row.id);
        if (original) {
          Object.assign(original, this.updateValues);
          updated.push(original);
        }
      });
      saveDatabase();
      const selected = updated.map((row) => applySelect(row, this.selectString));
      return {
        data: this.returnSingle ? selected[0] ?? null : selected,
        error: null,
        count: this.countExact ? updated.length : undefined,
      };
    }

    if (this.deleteFlag) {
      const idsToDelete = new Set(rows.map((row) => row.id));
      for (let i = db[this.table].length - 1; i >= 0; i -= 1) {
        if (idsToDelete.has(db[this.table][i].id)) {
          db[this.table].splice(i, 1);
        }
      }
      saveDatabase();
      return {
        data: this.head ? [] : rows.map((row) => applySelect(row, this.selectString)),
        error: null,
        count: this.countExact ? count : undefined,
      };
    }

    const selected = rows.map((row) => applySelect(row, this.selectString));
    if (this.head) {
      return {
        data: [],
        error: null,
        count: this.countExact ? count : undefined,
      };
    }

    if (this.returnSingle) {
      return {
        data: selected[0] ?? null,
        error: null,
        count: this.countExact ? count : undefined,
      };
    }

    return {
      data: selected,
      error: null,
      count: this.countExact ? count : undefined,
    };
  }

  then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    return this.execute().then(onFulfilled, onRejected);
  }
}

function from(table: TableKey) {
  return new LocalQuery(table);
}

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: auth.session } }),
    onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
      authSubscribers.push(callback);
      return { data: { subscription: { unsubscribe: () => { const index = authSubscribers.indexOf(callback); if (index >= 0) authSubscribers.splice(index, 1); } } } };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const user = findUserByEmail(email);
      if (!user || user.password !== password) {
        return { data: null, error: { message: 'Invalid email or password' } };
      }
      persistAuth(user);
      return { data: { user: buildSession(user).user }, error: null };
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, any> } }) => {
      if (findUserByEmail(email)) {
        return { data: null, error: { message: 'Email already registered' } };
      }
      const user = {
        id: createId('user'),
        email,
        password,
        user_metadata: {
          full_name: options?.data?.full_name ?? '',
          role: 'user',
          ...options?.data,
        },
        created_at: new Date().toISOString(),
      };
      db.users.push(user);
      saveDatabase();
      persistAuth(user);
      return { data: { user: buildSession(user).user }, error: null };
    },
    signOut: async () => {
      persistAuth(null);
      return { data: null, error: null };
    },
    resetPasswordForEmail: async (_args: { email: string }, _options: { redirectTo: string }) => {
      const user = findUserByEmail(_args.email);
      if (!user) {
        return { data: null, error: { message: 'Email not found' } };
      }
      user.password = 'password123';
      saveDatabase();
      return { data: { message: 'New password saved. Use password123 to sign in.' }, error: null };
    },
    updateUser: async ({ data }: { data: Record<string, any> }) => {
      if (!auth.session) {
        return { data: null, error: { message: 'No active session' } };
      }
      const user = findUserById(auth.session.user.id);
      if (!user) {
        return { data: null, error: { message: 'User not found' } };
      }
      user.user_metadata = { ...user.user_metadata, ...data };
      saveDatabase();
      auth.session = buildSession(user);
      saveAuthState();
      return { data: { user: auth.session.user }, error: null };
    },
  },
  from,
};

export const TABLES = {
  categories: 'categories',
  brands: 'brands',
  products: 'products',
  reviews: 'reviews',
  coupons: 'coupons',
  addresses: 'addresses',
  orders: 'orders',
  orderItems: 'order_items',
  wishlists: 'wishlists',
  carts: 'carts',
  cartItems: 'cart_items',
} as const;
