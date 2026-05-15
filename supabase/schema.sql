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
