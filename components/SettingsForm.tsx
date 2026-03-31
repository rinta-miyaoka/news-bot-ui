'use client'

import { useState } from 'react'
import { UserSettings } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'business', label: 'ビジネス' },
  { value: 'technology', label: 'テクノロジー' },
  { value: 'sports', label: 'スポーツ' },
  { value: 'entertainment', label: 'エンタメ' },
  { value: 'health', label: 'ヘルス' },
  { value: 'science', label: 'サイエンス' },
]

const SCHEDULES = ['07:00', '08:00', '09:00', '10:00', '12:00', '18:00', '20:00']

const BLANK: UserSettings = {
  user_name: '',
  slack_webhook_url: '',
  keywords: [],
  categories: [],
  language: 'ja',
  schedule: '09:00',
  max_articles: 5,
}

type Props = {
  initial?: UserSettings
  onSaved: () => void
  onCancel?: () => void
}

export default function SettingsForm({ initial, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<UserSettings>(initial ?? BLANK)
  const [keywordInput, setKeywordInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addKeyword = () => {
    const kw = keywordInput.trim()
    if (kw && !form.keywords.includes(kw)) {
      setForm({ ...form, keywords: [...form.keywords, kw] })
    }
    setKeywordInput('')
  }

  const removeKeyword = (kw: string) => {
    setForm({ ...form, keywords: form.keywords.filter(k => k !== kw) })
  }

  const toggleCategory = (cat: string) => {
    const cats = form.categories.includes(cat)
      ? form.categories.filter(c => c !== cat)
      : [...form.categories, cat]
    setForm({ ...form, categories: cats })
  }

  const handleSave = async () => {
    if (!form.user_name.trim()) return setError('名前を入力してください')
    if (!form.slack_webhook_url.trim()) return setError('Webhook URLを入力してください')
    if (!form.slack_webhook_url.startsWith('https://hooks.slack.com/')) return setError('Slack Webhook URLの形式が正しくありません')
    if (form.keywords.length === 0 && form.categories.length === 0) return setError('キーワードかカテゴリを少なくとも1つ設定してください')

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{initial?.id ? '設定を編集' : '新規ユーザーを追加'}</h2>

      {/* 名前 */}
      <label style={styles.label}>名前</label>
      <input
        style={styles.input}
        placeholder="例: みやりん"
        value={form.user_name}
        onChange={e => setForm({ ...form, user_name: e.target.value })}
      />

      {/* Webhook URL */}
      <label style={styles.label}>Slack Webhook URL</label>
      <input
        style={styles.input}
        placeholder="https://hooks.slack.com/services/..."
        value={form.slack_webhook_url}
        onChange={e => setForm({ ...form, slack_webhook_url: e.target.value })}
        type="password"
      />

      {/* キーワード */}
      <label style={styles.label}>キーワード</label>
      <div style={styles.row}>
        <input
          style={{ ...styles.input, flex: 1, marginBottom: 0 }}
          placeholder="例: 新規事業"
          value={keywordInput}
          onChange={e => setKeywordInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addKeyword()}
        />
        <button style={styles.addBtn} onClick={addKeyword}>追加</button>
      </div>
      <div style={styles.tags}>
        {form.keywords.map(kw => (
          <span key={kw} style={styles.tag}>
            {kw}
            <button style={styles.tagRemove} onClick={() => removeKeyword(kw)}>×</button>
          </span>
        ))}
      </div>

      {/* カテゴリ */}
      <label style={styles.label}>カテゴリ</label>
      <div style={styles.checkboxGroup}>
        {CATEGORIES.map(cat => (
          <label key={cat.value} style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.categories.includes(cat.value)}
              onChange={() => toggleCategory(cat.value)}
              style={{ marginRight: 6 }}
            />
            {cat.label}
          </label>
        ))}
      </div>

      {/* 言語 */}
      <label style={styles.label}>言語</label>
      <select
        style={styles.select}
        value={form.language}
        onChange={e => setForm({ ...form, language: e.target.value as UserSettings['language'] })}
      >
        <option value="ja">日本語</option>
        <option value="en">英語</option>
        <option value="both">両方</option>
      </select>

      {/* 送信時刻 */}
      <label style={styles.label}>送信時刻（日本時間）</label>
      <select
        style={styles.select}
        value={form.schedule}
        onChange={e => setForm({ ...form, schedule: e.target.value })}
      >
        {SCHEDULES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* 件数 */}
      <label style={styles.label}>1回の送信件数</label>
      <select
        style={styles.select}
        value={form.max_articles}
        onChange={e => setForm({ ...form, max_articles: Number(e.target.value) })}
      >
        {[3, 5, 8, 10].map(n => (
          <option key={n} value={n}>{n}件</option>
        ))}
      </select>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.row}>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存する'}
        </button>
        {onCancel && (
          <button style={styles.cancelBtn} onClick={onCancel}>キャンセル</button>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '28px 32px',
    boxShadow: '0 2px 12px rgba(40,75,125,0.1)',
    maxWidth: 560,
    margin: '0 auto',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#284B7D',
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#284B7D',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #c8d9ee',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 4,
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #c8d9ee',
    borderRadius: 8,
    fontSize: 14,
    background: '#fff',
  },
  row: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  addBtn: {
    padding: '10px 16px',
    background: '#567EB4',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    background: '#E8CDA9',
    color: '#284B7D',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  tagRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#567EB4',
    fontSize: 15,
    padding: 0,
    lineHeight: 1,
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px 20px',
    marginTop: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 24,
    padding: '12px 28px',
    background: '#284B7D',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  cancelBtn: {
    marginTop: 24,
    padding: '12px 20px',
    background: '#f0f4fa',
    color: '#567EB4',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    cursor: 'pointer',
  },
  error: {
    color: '#c0392b',
    fontSize: 13,
    marginTop: 12,
  },
}
