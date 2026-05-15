-- Migration: add contact_messages table
-- Run this in Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  status     TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anyone to insert (public contact form)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert contact" ON contact_messages FOR INSERT WITH CHECK (true);
-- Only service role (admin) can read/update/delete
CREATE POLICY "Admin all contact"     ON contact_messages FOR ALL USING (auth.role() = 'service_role');
