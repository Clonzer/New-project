-- Sample data for testing the landing page
-- Run this in Supabase SQL Editor to populate the database

-- First, let's create some sample profiles (users)
INSERT INTO profiles (id, username, display_name, avatar_url, role, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'maker1', '3D Printing Pro', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maker1', 'seller', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'laser_expert', 'Laser Cutting Studio', 'https://api.dicebear.com/7.x/avataaars/svg?seed=laser', 'seller', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'cnc_works', 'CNC Machining Co', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cnc', 'seller', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'design_hub', 'Design Services', 'https://api.dicebear.com/7.x/avataaars/svg?seed=design', 'seller', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create sellers for these users
INSERT INTO sellers (id, user_id, store_name, store_setup_complete, accepting_orders, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '3D Printing Pro', true, true, NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Laser Cutting Studio', true, true, NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'CNC Machining Co', true, true, NOW()),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Design Services', true, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some sample listings
INSERT INTO listings (id, seller_id, title, description, price, category, images, listing_type, is_active, views, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Custom 3D Printed Miniature', 'High-quality 3D printed miniature for tabletop gaming', 29.99, '3D Printing', ARRAY['https://picsum.photos/seed/miniature/400/400.jpg'], 'product', true, 234, NOW()),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Functional 3D Printed Parts', 'Custom mechanical parts and prototypes', 49.99, '3D Printing', ARRAY['https://picsum.photos/seed/parts/400/400.jpg'], 'product', true, 156, NOW()),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Laser Cut Signage', 'Custom laser-cut signs and displays', 89.99, 'Laser Cutting', ARRAY['https://picsum.photos/seed/sign/400/400.jpg'], 'product', true, 89, NOW()),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Laser Engraved Gifts', 'Personalized laser-engraved items', 34.99, 'Laser Cutting', ARRAY['https://picsum.photos/seed/gifts/400/400.jpg'], 'product', true, 312, NOW()),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'CNC Machined Components', 'Precision CNC machined parts', 129.99, 'CNC Machining', ARRAY['https://picsum.photos/seed/cnc/400/400.jpg'], 'product', true, 67, NOW()),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Custom Metal Fabrication', 'Bespoke metal fabrication services', 199.99, 'CNC Machining', ARRAY['https://picsum.photos/seed/metal/400/400.jpg'], 'product', true, 45, NOW())
ON CONFLICT (id) DO NOTHING;
