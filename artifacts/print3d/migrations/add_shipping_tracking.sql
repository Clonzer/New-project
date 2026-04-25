-- Add shipping tracking and payment escrow fields to orders table

-- 1. Add tracking fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS tracking_status TEXT CHECK (tracking_status IN ('pre_transit', 'in_transit', 'out_for_delivery', 'delivered', 'exception')),
ADD COLUMN IF NOT EXISTS tracking_events JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- 2. Add payment/escrow fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS seller_stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS seller_earnings DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'held', 'captured', 'released', 'refunded'));

-- 3. Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_status ON orders(tracking_status) WHERE status = 'shipped';
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(payment_intent_id);

-- 4. Add RLS policies for tracking data
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyers can see their orders' tracking info
CREATE POLICY "Buyers can view their order tracking" ON orders
  FOR SELECT
  USING (buyer_id = auth.uid());

-- Sellers can see their sales' tracking info
CREATE POLICY "Sellers can view their sales tracking" ON orders
  FOR SELECT
  USING (seller_id = auth.uid());

-- 5. Create function to update tracking timestamp
CREATE OR REPLACE FUNCTION update_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for automatic timestamp updates on tracking changes
DROP TRIGGER IF EXISTS tracking_update_timestamp ON orders;
CREATE TRIGGER tracking_update_timestamp
  BEFORE UPDATE OF tracking_status, tracking_events ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_timestamp();

-- 7. Create notifications table for delivery/payment notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'order_delivered', 'payment_released', 'tracking_update', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 9. Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- 10. Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications 
  SET read = TRUE, updated_at = NOW()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create view for order tracking summary
CREATE OR REPLACE VIEW order_tracking_summary AS
SELECT 
  o.id,
  o.tracking_number,
  o.carrier,
  o.tracking_status,
  o.estimated_delivery,
  o.shipped_at,
  o.delivered_at,
  o.status as order_status,
  o.seller_id,
  o.buyer_id,
  o.total_price,
  o.seller_earnings,
  o.payment_status,
  JSONB_ARRAY_LENGTH(o.tracking_events) as event_count,
  CASE 
    WHEN o.delivered_at IS NOT NULL THEN 'completed'
    WHEN o.shipped_at IS NOT NULL THEN 'in_progress'
    ELSE 'pending'
  END as tracking_phase
FROM orders o
WHERE o.tracking_number IS NOT NULL;

-- 12. Add shipping labels table for generated labels
CREATE TABLE IF NOT EXISTS shipping_labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  tracking_number TEXT NOT NULL UNIQUE,
  carrier TEXT NOT NULL,
  label_url TEXT,
  rate DECIMAL(10, 2),
  estimated_days INTEGER,
  from_address JSONB,
  to_address JSONB,
  package_details JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'voided', 'used')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_shipping_labels_order_id ON shipping_labels(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_tracking ON shipping_labels(tracking_number);

ALTER TABLE shipping_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their shipping labels" ON shipping_labels
  FOR SELECT
  USING (
    order_id::text IN (
      SELECT id::text FROM orders WHERE seller_id::text = auth.uid()::text
    )
  );

COMMENT ON TABLE orders IS 'Orders with tracking and payment escrow support';
COMMENT ON COLUMN orders.tracking_number IS 'Carrier tracking number for the shipment';
COMMENT ON COLUMN orders.payment_intent_id IS 'Stripe PaymentIntent ID for escrow hold';
COMMENT ON COLUMN orders.seller_earnings IS 'Amount to be transferred to seller after delivery';
COMMENT ON COLUMN orders.payment_status IS 'Payment state: pending, held, captured, released, refunded';
