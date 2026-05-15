# DJ Kenny Black — Booking Web App

Stockholm-based DJ booking site for **DJ Kenny Black** (Kenny Black Event AB). Built mobile-first with a dark, minimalist DJ aesthetic.

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS + CSS custom properties
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Music Player:** Mixcloud Widget API + animated VU meter

## Features

- Animated hero with canvas waveform visualization
- Genre ticker scroll
- About section with career timeline
- DB-driven services, events, testimonials
- Booking form → Supabase `bookings` table
- Mixcloud footer player (9 mixes from @soulcorner-kennyblack)
- VU meter that animates with play/pause state
- 100% mobile-first responsive

## Setup

### 1. Supabase

Create a project at [supabase.com](https://supabase.com), then run the schema:

```sql
-- Copy and run: supabase/schema.sql
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Then fill in your Supabase URL and anon key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

Add the environment variables in Vercel project settings.

## Mixcloud

Mixes stream from [@soulcorner-kennyblack](https://www.mixcloud.com/soulcorner-kennyblack/).

The VU meter animates using a spring physics simulation when playing — since cross-origin audio analysis is blocked by browsers, the meter uses a seeded pseudo-random oscillator that syncs to play/pause state.

## Contact

Kenny Black Event AB  
+46 73 941 40 65  
kennyblack@gmail.com  
[@djkennyblackevent](https://instagram.com/djkennyblackevent)
