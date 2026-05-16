'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const SEO_KEYS = [
  { key: 'seo_title',         label: 'Page Title',            type: 'text',     hint: '50–60 chars ideal',        max: 70  },
  { key: 'seo_description',   label: 'Meta Description',      type: 'textarea', hint: '120–160 chars ideal',      max: 200 },
  { key: 'seo_og_image',      label: 'Social Share Image URL', type: 'url',     hint: 'Recommended 1200×630 px'          },
  { key: 'seo_og_image_alt',  label: 'Image Alt Text',        type: 'text',     hint: 'Describes the image for screen readers' },
  { key: 'seo_canonical_url', label: 'Canonical / Site URL',  type: 'url',     hint: 'e.g. https://djkennyblack.se'     },
  { key: 'seo_twitter_handle',label: 'Twitter / X Handle',    type: 'text',     hint: 'e.g. @kennyblackdj'               },
  { key: 'seo_keywords',      label: 'Keywords (comma-sep)',  type: 'text',     hint: 'DJ Kenny Black, Stockholm DJ, …'  },
]

const DEFAULTS: Record<string, string> = {
  seo_title:          'DJ Kenny Black — Stockholm\'s Pioneer Vinyl DJ',
  seo_description:    'Book DJ Kenny Black for your event. Swedish hip hop pioneer, vinyl specialist, and music historian. Deep house, soul, funk. 40+ years on the decks.',
  seo_og_image:       '',
  seo_og_image_alt:   'DJ Kenny Black behind the decks',
  seo_canonical_url:  'https://djkennyblack.vercel.app',
  seo_twitter_handle: '',
  seo_keywords:       'DJ Kenny Black, Stockholm DJ, boka DJ, vinyl DJ, deep house, soul funk',
}

export default function AdminSEO() {
  const [values, setValues]   = useState<Record<string, string>>(DEFAULTS)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('key, value')
      .in('key', SEO_KEYS.map((k) => k.key))
      .then(({ data }) => {
        if (!data?.length) return
        const patch: Record<string, string> = {}
        data.forEach((d) => { if (d.value) patch[d.key] = d.value })
        setValues((prev) => ({ ...prev, ...patch }))
      })
  }, [])

  const set = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }))
    if (key === 'seo_og_image') setImgError(false)
  }

  const save = async () => {
    setSaving(true)
    for (const { key } of SEO_KEYS) {
      await supabase.from('site_settings').upsert({
        key,
        value: values[key] || '',
        label: SEO_KEYS.find((k) => k.key === key)?.label || key,
        type: 'text',
        group_name: 'seo',
        updated_at: new Date().toISOString(),
      })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const title       = values.seo_title       || DEFAULTS.seo_title
  const description = values.seo_description || DEFAULTS.seo_description
  const image       = values.seo_og_image
  const site        = values.seo_canonical_url || DEFAULTS.seo_canonical_url
  const domain      = (() => { try { return new URL(site).hostname } catch { return site } })()

  const inputCls = `w-full px-3 py-2.5 text-sm outline-none transition-all
    bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]
    focus:border-[var(--accent)] placeholder:text-[var(--muted-2)]`

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black text-xl" style={{ color: 'var(--text)' }}>SEO &amp; Social Sharing</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            Controls how the site appears in Google, Twitter/X, Facebook, WhatsApp, iMessage, and other link previews.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-all"
          style={{ background: saved ? '#16a34a' : 'var(--accent)', color: '#fff' }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Left: Fields ── */}
        <div className="space-y-4">
          {SEO_KEYS.map(({ key, label, type, hint, max }) => {
            const val = values[key] || ''
            const count = val.length
            const overMax = max && count > max
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
                    {label}
                  </label>
                  {max && (
                    <span
                      className="text-xs font-bold"
                      style={{ color: overMax ? '#ef4444' : count > max * 0.85 ? '#f59e0b' : 'var(--muted-2)' }}
                    >
                      {count}/{max}
                    </span>
                  )}
                </div>
                {type === 'textarea' ? (
                  <textarea
                    value={val}
                    onChange={(e) => set(key, e.target.value)}
                    rows={3}
                    className={inputCls}
                    style={{ resize: 'vertical' }}
                    placeholder={DEFAULTS[key]}
                  />
                ) : (
                  <input
                    type={type === 'url' ? 'url' : 'text'}
                    value={val}
                    onChange={(e) => set(key, e.target.value)}
                    className={inputCls}
                    placeholder={DEFAULTS[key] || hint}
                  />
                )}
                {hint && <p className="text-xs mt-1" style={{ color: 'var(--muted-2)' }}>{hint}</p>}
                {overMax && (
                  <p className="text-xs mt-1 font-bold" style={{ color: '#ef4444' }}>
                    Over recommended length — search engines may truncate this.
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Right: Live Previews ── */}
        <div className="space-y-5">

          {/* Google snippet */}
          <div>
            <p className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--muted)' }}>
              🔍 Google Search Snippet
            </p>
            <div className="p-4 rounded" style={{ background: '#fff', border: '1px solid #e0e0e0' }}>
              <p className="truncate" style={{ color: '#1a0dab', fontSize: '18px', lineHeight: '1.3', fontFamily: 'Arial, sans-serif' }}>
                {title}
              </p>
              <p style={{ color: '#006621', fontSize: '13px', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>
                {domain}
              </p>
              <p style={{ color: '#545454', fontSize: '13px', fontFamily: 'Arial, sans-serif', marginTop: '3px', lineHeight: '1.4' }}
                className="line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          {/* Twitter/X card */}
          <div>
            <p className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--muted)' }}>
              𝕏 Twitter / X Card
            </p>
            <div className="overflow-hidden" style={{ border: '1px solid #e1e8ed', borderRadius: '12px', background: '#fff', maxWidth: '440px' }}>
              {image && !imgError ? (
                <img
                  src={image}
                  alt="OG preview"
                  className="w-full object-cover"
                  style={{ maxHeight: '220px' }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full flex items-center justify-center"
                  style={{ height: '180px', background: '#f5f8fa', color: '#aab8c2', fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>
                  {image ? '⚠ Image could not load' : 'No image set — add OG image URL →'}
                </div>
              )}
              <div className="px-3 py-2.5">
                <p style={{ color: '#8899a6', fontSize: '12px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {domain}
                </p>
                <p className="font-bold truncate" style={{ color: '#14171a', fontSize: '14px', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>
                  {title}
                </p>
                <p className="line-clamp-2" style={{ color: '#657786', fontSize: '13px', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>
                  {description}
                </p>
              </div>
            </div>
          </div>

          {/* Facebook / OG */}
          <div>
            <p className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: 'var(--muted)' }}>
              📘 Facebook / WhatsApp / iMessage
            </p>
            <div className="overflow-hidden" style={{ border: '1px solid #dddfe2', background: '#f2f3f5', maxWidth: '440px' }}>
              {image && !imgError ? (
                <img
                  src={image}
                  alt="OG preview"
                  className="w-full object-cover"
                  style={{ maxHeight: '230px' }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full flex items-center justify-center"
                  style={{ height: '180px', background: '#e9ebee', color: '#bec3c9', fontSize: '13px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  {image ? '⚠ Image could not load' : 'No image set'}
                </div>
              )}
              <div className="px-3 py-2.5" style={{ borderTop: '1px solid #dddfe2' }}>
                <p style={{ color: '#606770', fontSize: '11px', fontFamily: 'Helvetica, Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {domain}
                </p>
                <p className="font-bold" style={{ color: '#1d2129', fontSize: '14px', fontFamily: 'Helvetica, Arial, sans-serif', marginTop: '3px', lineHeight: '1.3' }}
                  dangerouslySetInnerHTML={{ __html: title }} />
                <p className="line-clamp-2" style={{ color: '#606770', fontSize: '12px', fontFamily: 'Helvetica, Arial, sans-serif', marginTop: '3px' }}>
                  {description}
                </p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="p-4 space-y-2 text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="font-bold tracking-wider uppercase" style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>SEO Checklist</p>
            {[
              { ok: values.seo_title.length >= 30 && values.seo_title.length <= 65,  label: `Title 30–65 chars (${values.seo_title.length})` },
              { ok: values.seo_description.length >= 100 && values.seo_description.length <= 165, label: `Description 100–165 chars (${values.seo_description.length})` },
              { ok: !!values.seo_og_image,  label: 'OG image URL set' },
              { ok: !!values.seo_og_image_alt, label: 'OG image alt text set' },
              { ok: !!values.seo_canonical_url, label: 'Canonical URL set' },
              { ok: values.seo_keywords.split(',').filter(Boolean).length >= 3, label: 'At least 3 keywords' },
            ].map(({ ok, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span style={{ color: ok ? '#16a34a' : '#ef4444' }}>{ok ? '✓' : '✗'}</span>
                <span style={{ color: ok ? 'var(--text)' : 'var(--muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
