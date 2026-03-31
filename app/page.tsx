'use client'

import { useEffect, useState } from 'react'
import SettingsForm from '@/components/SettingsForm'
import { UserSettings } from '@/lib/supabase'

export default function Home() {
  const [users, setUsers] = useState<UserSettings[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/settings')
    const data = await res.json()
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('削除しますか？')) return
    await fetch('/api/settings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditTarget(null)
    load()
  }

  if (showForm || editTarget) {
    return (
      <main style={styles.main}>
        <Header />
        <SettingsForm
          initial={editTarget ?? undefined}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
        />
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <Header />

      <div style={styles.topBar}>
        <h2 style={styles.sectionTitle}>登録ユーザー一覧</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>+ 新規追加</button>
      </div>

      {loading ? (
        <p style={styles.empty}>読み込み中...</p>
      ) : users.length === 0 ? (
        <p style={styles.empty}>まだユーザーが登録されていません。「新規追加」から設定してください。</p>
      ) : (
        <div style={styles.grid}>
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={() => setEditTarget(user)}
              onDelete={() => handleDelete(user.id!)}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>📰 News Bot</div>
      <p style={styles.subtitle}>毎日のニュースをSlackにお届けします</p>
    </header>
  )
}

function UserCard({ user, onEdit, onDelete }: { user: UserSettings; onEdit: () => void; onDelete: () => void }) {
  const langLabel = { ja: '日本語', en: '英語', both: '日英両方' }[user.language]
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.userName}>{user.user_name}</span>
        <span style={styles.schedule}>{user.schedule} 送信</span>
      </div>
      <div style={styles.cardBody}>
        {user.keywords.length > 0 && (
          <div style={styles.tagRow}>
            {user.keywords.map(kw => (
              <span key={kw} style={styles.tag}>{kw}</span>
            ))}
          </div>
        )}
        <p style={styles.meta}>
          言語: {langLabel}　件数: {user.max_articles}件
          {user.categories.length > 0 && `カテゴリ: ${user.categories.join(', ')}`}
        </p>
      </div>
      <div style={styles.cardActions}>
        <button style={styles.editBtn} onClick={onEdit}>編集</button>
        <button style={styles.deleteBtn} onClick={onDelete}>削除</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 720, margin: '0 auto', padding: '0 20px 60px' },
  header: {
    background: 'linear-gradient(135deg, #284B7D, #567EB4)',
    color: '#fff',
    padding: '32px 32px 28px',
    marginBottom: 32,
    borderRadius: '0 0 16px 16px',
    textAlign: 'center',
  },
  logo: { fontSize: 26, fontWeight: 800, letterSpacing: 1 },
  subtitle: { margin: '8px 0 0', fontSize: 14, opacity: 0.85 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#284B7D', margin: 0 },
  addBtn: {
    padding: '10px 20px',
    background: '#284B7D',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  grid: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 2px 12px rgba(40,75,125,0.08)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userName: { fontSize: 17, fontWeight: 700, color: '#284B7D' },
  schedule: {
    fontSize: 13,
    fontWeight: 600,
    background: '#E8CDA9',
    color: '#284B7D',
    padding: '4px 10px',
    borderRadius: 20,
  },
  cardBody: { marginBottom: 16 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tag: {
    background: '#f0f4fa',
    color: '#567EB4',
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 13,
    fontWeight: 600,
  },
  meta: { fontSize: 13, color: '#777', margin: 0 },
  cardActions: { display: 'flex', gap: 8 },
  editBtn: {
    padding: '8px 18px',
    background: '#567EB4',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '8px 18px',
    background: '#f0f4fa',
    color: '#c0392b',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
  },
  empty: { color: '#999', textAlign: 'center', marginTop: 60, fontSize: 15 },
}
