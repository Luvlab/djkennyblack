'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Setting {
  key: string
  value: string
  label: string
  type: string
  group_name: string
}

const DEFAULT_SETTINGS: Setting[] = [
  { key: 'accent_color', value: '#ff4500', label: 'Accent Color', type: 'color', group_name: 'theme' },
  { key: 'accent_gold', value: '#ffd700', label: 'Gold Accent', type: 'color', group_name: 'theme' },
  { key: 'custom_css', value: '', label: 'Custom CSS', type: 'css', group_name: 'theme' },
  { key: 'hero_tagline', value: 'Pioneer · Vinyl Specialist · 40+ Years', label: 'Hero Tagline', type: 'text', group_name: 'content' },
  { key: 'contact_phone', value: '+46 73 941 40 65', label: 'Contact Phone', type: 'text', group_name: 'contact' },
  { key: 'contact_email', value: 'kennyblack@gmail.com', label: 'Contact Email', type: 'text', group_name: 'contact' },
  { key: 'show_booking_form', value: 'true', label: 'Show Booking Form', type: 'boolean', group_name: 'features' },
  { key: 'show_events', value: 'true', label: 'Show Events Section', type: 'boolean', group_name: 'features' },
]

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setSettings((prev) =>
          prev.map((s) => {
            const found = data.find((d) => d.key === s.key)
            return found ? { ...s, value: found.value || s.value } : s
          })
        )
      }
    })
  }, [])

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value } : s))
  }

  const saveAll = async () => {
    setSaving(true)
    for (const s of settings) {
      await supabase.from('site_settings').upsert({ key: s.key, value: s.value, label: s.label, type: s.type, group_name: s.group_name, updated_at: new Date().toISOString() })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)

    // Apply custom CSS immediately
    const customCSS = settings.find((s) => s.key === 'custom_css')?.value
    const accentColor = settings.find((s) => s.key === 'accent_color')?.value
    if (accentColor) {
      document.documentElement.style.setProperty('--accent', accentColor)
    }
    if (customCSS) {
      let styleTag = document.getElementById('admin-custom-css')
      if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.id = 'admin-custom-css'
        document.head.appendChild(styleTag)
      }
      styleTag.textContent = customCSS
    }
  }

  const groups = [...new Set(settings.map((s) => s.group_name))]

  const inputCls = `w-full px-3 py-2 text-sm rounded outline-none transition-all bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]`

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-xl" style={{ color: 'var(--text)' }}>Settings & CSS</h1>
        <button onClick={saveAll} disabled={saving}
          className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase rounded transition-all"
          style={{ background: saved ? '#16a34a' : 'var(--accent)', color: '#fff' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save All Settings'}
        </button>
      </div>

      {groups.map((group) => (
        <div key={group} className="p-5 rounded space-y-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-sm tracking-wider uppercase" style={{ color: 'var(--accent)' }}>
            {group}
          </h2>
          {settings.filter((s) => s.group_name === group).map((s) => (
            <div key={s.key}>
              <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>
                {s.label}
              </label>
              {s.type === 'color' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={s.value || '#ff4500'}
                    onChange={(e) => updateSetting(s.key, e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => updateSetting(s.key, e.target.value)}
                    className={`${inputCls} flex-1`}
                    placeholder="#ff4500"
                  />
                  <div
                    className="w-8 h-8 rounded flex-shrink-0"
                    style={{ background: s.value || '#ff4500' }}
                  />
                </div>
              ) : s.type === 'css' ? (
                <textarea
                  value={s.value}
                  onChange={(e) => updateSetting(s.key, e.target.value)}
                  rows={8}
                  className={`${inputCls} font-mono text-xs`}
                  placeholder="/* Custom CSS */&#10;:root { --custom-var: value; }&#10;.section { ... }"
                  style={{ resize: 'vertical' }}
                />
              ) : s.type === 'boolean' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => updateSetting(s.key, s.value === 'true' ? 'false' : 'true')}
                    className="relative w-10 h-6 rounded-full transition-all cursor-pointer"
                    style={{ background: s.value === 'true' ? 'var(--accent)' : 'var(--border)' }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: s.value === 'true' ? '22px' : '4px' }}
                    />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text)' }}>
                    {s.value === 'true' ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              ) : (
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => updateSetting(s.key, e.target.value)}
                  className={inputCls}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Preview note */}
      <div className="p-4 rounded text-xs" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
        💡 Color changes and custom CSS apply immediately after saving. Refresh the public site to see all content changes.
      </div>
    </div>
  )
}
