-- Equipment management and enhanced listings
CREATE TABLE IF NOT EXISTS equipment_groups (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL,
    group_id INTEGER REFERENCES equipment_groups(id),
    name TEXT NOT NULL,
    model TEXT,
    manufacturer TEXT,
    category TEXT NOT NULL,
    specifications JSONB,
    purchase_date TIMESTAMP,
    purchase_price INTEGER,
    status TEXT NOT NULL DEFAULT 'operational',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add new columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT '3d_printing';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS equipment_used INTEGER[] DEFAULT '{}';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS equipment_groups INTEGER[] DEFAULT '{}';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_print_on_demand BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_digital_product BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS digital_files TEXT[] DEFAULT '{}';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS stock_type TEXT NOT NULL DEFAULT 'inventory';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_groups_seller_id ON equipment_groups(seller_id);
CREATE INDEX IF NOT EXISTS idx_equipment_seller_id ON equipment(seller_id);
CREATE INDEX IF NOT EXISTS idx_equipment_group_id ON equipment(group_id);
CREATE INDEX IF NOT EXISTS idx_listings_product_type ON listings(product_type);
CREATE INDEX IF NOT EXISTS idx_listings_stock_type ON listings(stock_type);
CREATE INDEX IF NOT EXISTS idx_listings_is_digital_product ON listings(is_digital_product);