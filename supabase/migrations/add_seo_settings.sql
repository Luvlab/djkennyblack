-- Migration: seed default SEO / social-share settings
-- Run in Supabase → SQL Editor

INSERT INTO site_settings (key, value, label, type, group_name) VALUES
  ('seo_title',          'DJ Kenny Black — Stockholm''s Pioneer Vinyl DJ',
   'Page Title', 'text', 'seo'),

  ('seo_description',    'Book DJ Kenny Black for your event. Swedish hip hop pioneer, vinyl specialist and music historian. Deep house, soul, funk. 40+ years on the decks.',
   'Meta Description', 'text', 'seo'),

  ('seo_og_image',       '',
   'Social Share Image URL', 'text', 'seo'),

  ('seo_og_image_alt',   'DJ Kenny Black behind the decks',
   'Image Alt Text', 'text', 'seo'),

  ('seo_canonical_url',  'https://djkennyblack.vercel.app',
   'Canonical / Site URL', 'text', 'seo'),

  ('seo_twitter_handle', '',
   'Twitter / X Handle', 'text', 'seo'),

  ('seo_keywords',       'DJ Kenny Black, Stockholm DJ, boka DJ, vinyl DJ, deep house, soul funk DJ, hip hop pioneer',
   'Keywords', 'text', 'seo')

ON CONFLICT (key) DO NOTHING;
