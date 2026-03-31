'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import SettingsForm from '@/components/SettingsForm'
import { UserSettings } from '@/lib/supabase'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <LoadingScreen />
  if (!session) return <LoginScreen />

  return <Dashboard />
}

function LoadingScreen() {
  return (
    <main style={styles.center}>
      <p style={{ color: '#567EB4' }}>読み込み中...</p>
    </main>
  )
}

function LoginScreen() {
  return (
    <main style={styles.center}>
      <div style={styles.loginCard}>
        <div style={styles.logo}>📰 News Bot</div>
        <p style={styles.loginDesc}>毎日のニュースをSlackにお届けします</p>
        <button style={styles.slackBtn} onClick={() => signIn('slack')}>
          <SlackIcon />
          Slackでログイン
        </button>
      </div>
    </main>
  )
}

function Dashboard() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserSettings[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/settings')
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
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
        <Header session={session} />
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
      <Header session={session} />
      <div style={styles.topBar}>
        <h2 style={styles.sectionTitle}>マイ設定</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>+ 新規追加</button>
      </div>

      {loading ? (
        <p style={styles.empty}>読み込み中...</p>
      ) : users.length === 0 ? (
        <p style={styles.empty}>まだ設定がありません。「新規追加」から設定してください。</p>
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

function Header({ session }: { session: ReturnType<typeof useSession>['data'] }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerInner}>
        <div style={styles.logo}>📰 News Bot</div>
        <div style={styles.userArea}>
          {session?.user?.image && (
            <img src={session.user.image} alt="" style={styles.avatar} />
          )}
          <span style={styles.userName}>{session?.user?.name}</span>
          <button style={styles.logoutBtn} onClick={() => signOut()}>ログアウト</button>
        </div>
      </div>
    </header>
  )
}

function UserCard({ user, onEdit, onDelete }: { user: UserSettings; onEdit: () => void; onDelete: () => void }) {
  const langLabel = { ja: '日本語', en: '英語', both: '日英両方' }[user.language]
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardName}>{user.user_name}</span>
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
          {user.categories.length > 0 && `　カテゴリ: ${user.categories.join(', ')}`}
        </p>
      </div>
      <div style={styles.cardActions}>
        <button style={styles.editBtn} onClick={onEdit}>編集</button>
        <button style={styles.deleteBtn} onClick={onDelete}>削除</button>
      </div>
    </div>
  )
}

function SlackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 10 }} fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  )
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '48px 40px',
    boxShadow: '0 4px 24px rgba(40,75,125,0.12)',
    textAlign: 'center',
    maxWidth: 360,
    width: '100%',
  },
  logo: { fontSize: 28, fontWeight: 800, color: '#284B7D', marginBottom: 12 },
  loginDesc: { color: '#777', fontSize: 14, marginBottom: 32 },
  slackBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '14px 20px',
    background: '#4A154B',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  main: { maxWidth: 720, margin: '0 auto', padding: '0 20px 60px' },
  header: {
    background: 'linear-gradient(135deg, #284B7D, #567EB4)',
    color: '#fff',
    padding: '0 24px',
    marginBottom: 32,
    borderRadius: '0 0 16px 16px',
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
  },
  userArea: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: '50%' },
  userName: { fontSize: 14, fontWeight: 600 },
  logoutBtn: {
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
  },
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
  cardName: { fontSize: 17, fontWeight: 700, color: '#284B7D' },
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
