DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'both');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE shop_mode AS ENUM ('catalog', 'open', 'both');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE printer_technology AS ENUM ('FDM', 'SLA', 'SLS', 'MSLA', 'MJF', 'DMLS', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE equipment_category AS ENUM ('printing_3d', 'woodworking', 'metalworking', 'services', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'printing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  rating REAL,
  review_count INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  shop_name TEXT,
  shop_mode shop_mode,
  platform_fee_percent REAL DEFAULT 10,
  default_shipping_cost REAL DEFAULT 0,
  total_prints INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_shipping_cost REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS shop_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS shop_mode shop_mode;
ALTER TABLE users ADD COLUMN IF NOT EXISTS platform_fee_percent REAL DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_prints INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_orders INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating REAL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;

CREATE TABLE IF NOT EXISTS printers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  equipment_category equipment_category NOT NULL DEFAULT 'printing_3d',
  tool_or_service_type TEXT,
  name TEXT NOT NULL,
  technology printer_technology NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  build_volume TEXT,
  materials TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  layer_resolution_min REAL,
  layer_resolution_max REAL,
  price_per_hour REAL,
  price_per_gram REAL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  image_url TEXT,
  total_jobs_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  base_price REAL NOT NULL,
  shipping_cost REAL NOT NULL DEFAULT 0,
  estimated_days_min INTEGER NOT NULL,
  estimated_days_max INTEGER NOT NULL,
  material TEXT,
  color TEXT,
  order_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL,
  seller_id INTEGER NOT NULL,
  listing_id INTEGER,
  title TEXT NOT NULL,
  file_url TEXT,
  notes TEXT,
  material TEXT,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  platform_fee REAL NOT NULL,
  shipping_cost REAL NOT NULL DEFAULT 0,
  total_price REAL NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  tracking_number TEXT,
  estimated_delivery TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  reviewee_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
