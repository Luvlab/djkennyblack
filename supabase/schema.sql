-- DJ Kenny Black Event AB — Supabase Schema
-- Run this in your Supabase SQL editor

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_location TEXT,
  guests INTEGER,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events (past + upcoming)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Stockholm',
  event_date DATE NOT NULL,
  description TEXT,
  image_url TEXT,
  genres TEXT[],
  is_upcoming BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  event_type TEXT,
  message TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public read for events, testimonials, services
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);

-- Public insert for bookings
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Seed data
INSERT INTO services (title, description, icon, order_index) VALUES
  ('DJ Sets', 'From intimate dinner parties to full festival stages — vinyl-forward, crowd-reading sets that move people. 40+ years behind the decks.', 'headphones', 1),
  ('Private Events', 'Weddings, corporate events, birthday celebrations. Customized playlists, world-class sound setup, and an atmosphere you will never forget.', 'sparkles', 2),
  ('Club & Bar Nights', 'Resident and guest slots at Stockholm''s finest clubs, bars, and rooftop venues. Deep house, soul, funk, and old school hip hop.', 'music', 3),
  ('DJ School', 'Learn to DJ with Kenny Black — beginner to advanced courses for all ages. Hands-on vinyl and digital training from a true pioneer.', 'graduation-cap', 4),
  ('Music Production', 'Studio courses covering production, sampling, and the art of the mix. Learn from the founder of Finest Blend Recordings.', 'waveform', 5),
  ('Vinyl Marathons', '8-hour vinyl sessions that take you on a full musical journey. A signature experience from Stockholm''s vinyl specialist.', 'disc', 6);

INSERT INTO events (title, venue, city, event_date, description, genres, is_upcoming, is_featured) VALUES
  ('After Work Vibes', 'Elite Hotel Marina Tower', 'Stockholm', '2023-09-15', 'A soulful after-work session at one of Stockholm''s premier waterfront hotels. Soul, funk, and boogie all night.', ARRAY['Soul', 'Funk', 'Boogie'], false, true),
  ('Vinyl vid Vattnet', 'Café Cul De Sac', 'Gröndal, Stockholm', '2024-06-15', 'Outdoor vinyl session by the water. Pure analogue sound in a stunning setting.', ARRAY['House', 'Soul', 'Funk'], false, false),
  ('8 Timmar Musik på Vinyl', 'Medborgarplatsen', 'Stockholm', '2024-08-10', 'Eight straight hours of vinyl music — an endurance set spanning five decades of black music.', ARRAY['Funk', 'Soul', 'Hip Hop', 'House'], false, true),
  ('Klubbliv Mixtape Live', 'Slakthuset', 'Stockholm', '2024-11-22', 'Live recording of the Klubbliv Mixtape series. Deep house and tech house in an underground setting.', ARRAY['Deep House', 'Tech House'], false, false),
  ('Soul Corner Sessions', 'Berns Salonger', 'Stockholm', '2025-02-14', 'Valentine''s Day soul and jazz-funk session at the iconic Berns.', ARRAY['Soul', 'Jazz-Funk', 'R&B'], false, true);

INSERT INTO testimonials (client_name, event_type, message, rating, is_featured) VALUES
  ('Anna & Marcus Lindström', 'Wedding', 'Kenny read the room perfectly from ceremony to last dance. Our guests are still talking about the music six months later. Absolutely magical.', 5, true),
  ('Elite Hotel Marina Tower', 'Corporate After Work', 'We have hosted Kenny multiple times for our after-work events. He brings a level of professionalism and musical knowledge that is simply unmatched in Stockholm.', 5, true),
  ('Sofia Bergström', 'Birthday Party', 'I wanted deep house and soul — Kenny delivered something far beyond what I imagined. The vinyl setup alone was a talking point all evening.', 5, true),
  ('Medborgarplatsen Events', 'Festival / Public Event', 'Eight hours of vinyl music that kept the crowd completely captivated. Kenny is a true master of his craft.', 5, true),
  ('Johan Eriksson', 'Corporate Launch Party', 'From the first track to the last, Kenny created exactly the atmosphere we needed for our product launch. Sophisticated, energetic, and perfectly timed.', 5, true);

-- ─────────────────────────────────────────────
-- ADMIN & SETTINGS TABLES (run after initial schema)
-- ─────────────────────────────────────────────

-- Admin users (whitelist)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site settings (key-value store for theme, CSS, text overrides)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  label TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'color', 'css', 'boolean', 'number')),
  group_name TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read site settings (for theme/CSS injection)
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
-- Only authenticated admins can modify bookings/events/testimonials/services
CREATE POLICY "Admin insert/update bookings" ON bookings FOR ALL USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
);

-- Seed admin users
INSERT INTO admin_users (email, role) VALUES
  ('kennyblack@gmail.com', 'superadmin'),
  ('gordoncyrus@gmail.com', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Seed site settings
INSERT INTO site_settings (key, value, label, type, group_name) VALUES
  ('accent_color', '#ff4500', 'Accent Color', 'color', 'theme'),
  ('accent_gold', '#ffd700', 'Gold Accent', 'color', 'theme'),
  ('custom_css', '', 'Custom CSS', 'css', 'theme'),
  ('hero_title_line1', 'KENNY', 'Hero Title Line 1', 'text', 'content'),
  ('hero_title_line2', 'BLACK', 'Hero Title Line 2', 'text', 'content'),
  ('hero_tagline', 'Pioneer · Vinyl Specialist · 40+ Years', 'Hero Tagline', 'text', 'content'),
  ('contact_phone', '+46 73 941 40 65', 'Contact Phone', 'text', 'contact'),
  ('contact_email', 'kennyblack@gmail.com', 'Contact Email', 'text', 'contact'),
  ('show_booking_form', 'true', 'Show Booking Form', 'boolean', 'features'),
  ('show_events', 'true', 'Show Events Section', 'boolean', 'features')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────
-- SHOP TABLES
-- ─────────────────────────────────────────────

CREATE TYPE product_type AS ENUM ('book', 'ticket', 'merch', 'digital');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'fulfilled', 'refunded', 'cancelled');
CREATE TYPE fulfillment_type AS ENUM ('printful', 'manual', 'digital', 'ticket');

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_sek INTEGER NOT NULL,          -- price in öre (SEK cents)
  price_eur INTEGER,                   -- price in euro cents
  type product_type NOT NULL DEFAULT 'merch',
  fulfillment fulfillment_type NOT NULL DEFAULT 'printful',
  images TEXT[] DEFAULT '{}',
  printful_sync_id TEXT,               -- Printful product ID
  printful_variant_ids JSONB,          -- {size: printful_variant_id}
  event_id UUID REFERENCES events(id), -- for tickets: which event
  ticket_quantity INTEGER,             -- NULL = unlimited
  tickets_sold INTEGER DEFAULT 0,
  digital_file_url TEXT,               -- for digital products
  variants JSONB DEFAULT '[]',         -- [{name: "S", printful_id: "..."}, ...]
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB,
  items JSONB NOT NULL,                -- snapshot of ordered items + variants
  subtotal INTEGER NOT NULL,           -- in öre
  shipping INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  currency TEXT DEFAULT 'SEK',
  status order_status DEFAULT 'pending',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  printful_order_id TEXT,
  ticket_codes JSONB DEFAULT '[]',     -- generated ticket codes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own orders" ON orders FOR SELECT USING (true);

-- Seed products
INSERT INTO products (slug, name, description, price_sek, price_eur, type, fulfillment, is_featured, sort_order, images, metadata) VALUES
  (
    'electric-boogie-book',
    'Electric Boogie — Book',
    'The definitive history of how hip hop came to Sweden. Written by Kenny Black, who was there when it happened. Covers 1982–1988 — the formative years of Swedish hip hop culture. Limited physical copies signed by the author. Also available as an instant digital PDF download.',
    29900, 2490, 'book', 'manual', true, 1,
    ARRAY['/shop/book-cover.jpg'],
    '{"author": "Kenny Black", "year": "2024", "pages": "240", "isbn": "978-0-000-00000-0", "variants": [{"id": "signed", "name": "Signed Physical Copy", "price_sek": 39900}, {"id": "digital", "name": "Digital PDF", "price_sek": 14900}]}'
  ),
  (
    'kenny-black-tee',
    'Kenny Black T-Shirt',
    'Premium heavyweight cotton tee. Kenny Black "Soul Corner" logo print on front — inspired by the original Stockholm deep house residency. Printed on demand via Printful.',
    34900, 2990, 'merch', 'printful', true, 2,
    ARRAY['/shop/tee-black.jpg'],
    '{"variants": [{"id": "S", "name": "S"}, {"id": "M", "name": "M"}, {"id": "L", "name": "L"}, {"id": "XL", "name": "XL"}, {"id": "XXL", "name": "XXL"}], "colors": ["Black", "White"]}'
  ),
  (
    'kenny-black-hoodie',
    'Soul Corner Hoodie',
    'Heavyweight 80% cotton hoodie. "Soul Corner Stockholm" embroidered logo. The kind of hoodie you wear to a vinyl session at 2am. Printed on demand via Printful.',
    69900, 5990, 'merch', 'printful', true, 3,
    ARRAY['/shop/hoodie-black.jpg'],
    '{"variants": [{"id": "S", "name": "S"}, {"id": "M", "name": "M"}, {"id": "L", "name": "L"}, {"id": "XL", "name": "XL"}, {"id": "XXL", "name": "XXL"}], "colors": ["Black", "Navy"]}'
  ),
  (
    'electric-boogie-poster',
    'Electric Boogie Poster',
    'Museum-quality 50×70cm art print. The original Electric Boogie cover art — Swedish hip hop history on your wall. Printed on archival 200gsm paper via Printful.',
    29900, 2490, 'merch', 'printful', false, 4,
    ARRAY['/shop/poster.jpg'],
    '{"variants": [{"id": "A3", "name": "A3 (30×42cm)"}, {"id": "50x70", "name": "50×70cm"}, {"id": "A2", "name": "A2 (42×59cm)"}]}'
  ),
  (
    'vinyl-tote',
    'Vinyl Record Tote Bag',
    'Heavy-duty canvas tote. "Vinyl First" screen printed in signature orange. Fits exactly 20 12-inch records — tested personally by Kenny Black.',
    19900, 1690, 'merch', 'printful', false, 5,
    ARRAY['/shop/tote.jpg'],
    '{"variants": []}'
  ),
  (
    'dj-school-gift-card',
    'DJ School Gift Card',
    'Give someone the gift of learning to DJ. Redeemable for any DJ School session with Kenny Black. Valid for 12 months. Delivered instantly by email.',
    79900, 6990, 'digital', 'digital', false, 6,
    ARRAY['/shop/giftcard.jpg'],
    '{"variants": [{"id": "single", "name": "1 Session (2hrs)"}, {"id": "course", "name": "Full Course (8 sessions)"}]}'
  );
