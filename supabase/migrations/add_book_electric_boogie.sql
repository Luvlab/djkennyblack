-- Migration: insert Electric Boogie book product
-- Run this in Supabase → SQL Editor

INSERT INTO products (
  slug,
  name,
  description,
  price_sek,
  price_eur,
  type,
  fulfillment,
  images,
  is_active,
  is_featured,
  sort_order,
  metadata
) VALUES (
  'electric-boogie',
  'Electric Boogie – När Hip Hop kom till Sverige 1982–1988',
  'Kenneth Agibous egna berättelse om hur hip hop kom till Sverige. Han var med i den allra första generationen av B-boys på 80-talet – tog tunnelbanan från Rinkeby till T-Centralen, dansade för pengar och köpte electro funk-skivor. Med ca 200 fotografier, tidningsartiklar och djupintervjuer berättar boken om pionjärerna, filmerna, musiken och nyheterna från New York som formade en hel generations identitet och livsstil i Sverige.',
  499,
  NULL,
  'book',
  'manual',
  ARRAY['https://www.nyabokhandeln.se/pub_images/large/9789152722350_1.Jpeg'],
  true,
  true,
  1,
  jsonb_build_object(
    'subtitle',      'När Hip Hop kom till Sverige 1982–1988',
    'author',        'Kenneth Agibou',
    'isbn',          '9789152722350',
    'publisher',     '5:e Elementet',
    'year',          2023,
    'pages',         208,
    'language',      'Svenska',
    'format',        'Inbunden (Hardcover), 287 × 207 mm, 208 sidor',
    'external_only', true,
    'quote',         'Äntligen berättad från ett svart perspektiv och av nån som var i gamet från dag 1.',
    'quote_by',      'Teddy Goitom – Stocktown / Afripedia',
    'buy_links', jsonb_build_array(
      jsonb_build_object('name', 'Bokus',          'url', 'https://www.bokus.com/bok/9789152722350/electric-boogie-nar-hip-hop-kom-till-sverige-1982-1988/'),
      jsonb_build_object('name', 'Adlibris',       'url', 'https://www.adlibris.com/se/bok/electric-boogie-nar-hip-hop-kom-till-sverige-1982-1988-9789152722350'),
      jsonb_build_object('name', 'Nya Bokhandeln', 'url', 'https://www.nyabokhandeln.se/facklitteratur/konst-kultur/dans/electric-boogie-nar-hip-hop-kom-till-sverige-1982-1988', 'price', '499 SEK'),
      jsonb_build_object('name', 'Hlstore',        'url', 'https://hlstore.com/en/books-magazines/hip-hop/electric-boogie-nar-hip-hop-kom-till-sverige-1982-1988/', 'price', '545 SEK'),
      jsonb_build_object('name', 'BookOutlet',     'url', 'https://www.bookoutlet.se/bok/electric-boogie-nar-hip-hop-kom-till-sverige-1982-1988/9789152722350'),
      jsonb_build_object('name', 'AbeBooks',       'url', 'https://www.abebooks.com/signed-first-edition/ELECTRIC-BOOGIE-N%C3%A4r-Hip-Hop-Kom/31887064271/bd', 'price', '~103 USD', 'note', 'Signerat förstaupplaga')
    )
  )
)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  price_sek   = EXCLUDED.price_sek,
  images      = EXCLUDED.images,
  is_active   = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  sort_order  = EXCLUDED.sort_order,
  metadata    = EXCLUDED.metadata;
