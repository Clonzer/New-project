-- Payment System Migration
-- Creates tables for payment methods, bank accounts, payouts, and seller balances

-- Payment Methods table (for storing Stripe payment methods)
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'card',
    stripe_payment_method_id VARCHAR(255),
    brand VARCHAR(50),
    last4 VARCHAR(4),
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    billing_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank Accounts table (for seller payouts)
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings')),
    last4 VARCHAR(4) NOT NULL,
    routing_last4 VARCHAR(4),
    account_holder_name VARCHAR(255),
    is_default BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'verified', 'errored')),
    stripe_bank_account_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller Balances table (for tracking earnings)
CREATE TABLE IF NOT EXISTS seller_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    available_balance DECIMAL(12, 2) DEFAULT 0.00,
    pending_balance DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'usd',
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts table (for tracking withdrawals)
CREATE TABLE IF NOT EXISTS payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'paid', 'failed')),
    bank_account_id UUID REFERENCES bank_accounts(id),
    bank_account_last4 VARCHAR(4),
    stripe_payout_id VARCHAR(255),
    description TEXT,
    arrival_date TIMESTAMP WITH TIME ZONE,
    failure_code VARCHAR(100),
    failure_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout Settings table (for automatic payouts configuration)
CREATE TABLE IF NOT EXISTS payout_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    automatic_payouts_enabled BOOLEAN DEFAULT false,
    payout_schedule VARCHAR(20) DEFAULT 'weekly' CHECK (payout_schedule IN ('daily', 'weekly', 'monthly')),
    minimum_payout_amount DECIMAL(12, 2) DEFAULT 25.00,
    next_scheduled_payout TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY payment_methods_user_policy ON payment_methods
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY bank_accounts_user_policy ON bank_accounts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY seller_balances_user_policy ON seller_balances
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY payouts_user_policy ON payouts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY payout_settings_user_policy ON payout_settings
    FOR ALL USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_balances_updated_at BEFORE UPDATE ON seller_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payout_settings_updated_at BEFORE UPDATE ON payout_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize seller balance on new seller registration
CREATE OR REPLACE FUNCTION initialize_seller_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO seller_balances (user_id, available_balance, pending_balance, currency)
    VALUES (NEW.id, 0.00, 0.00, 'usd')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-create seller balance when profile is created
-- Note: Uncomment if you want automatic balance creation
-- CREATE TRIGGER create_seller_balance_on_profile 
--     AFTER INSERT ON profiles
--     FOR EACH ROW 
--     EXECUTE FUNCTION initialize_seller_balance();

-- Comments for documentation
COMMENT ON TABLE payment_methods IS 'Stores customer payment methods (cards) for purchases';
COMMENT ON TABLE bank_accounts IS 'Stores seller bank accounts for receiving payouts';
COMMENT ON TABLE seller_balances IS 'Tracks seller available and pending balances';
COMMENT ON TABLE payouts IS 'Records of withdrawals/payouts to seller bank accounts';
COMMENT ON TABLE payout_settings IS 'Seller preferences for automatic payouts';
