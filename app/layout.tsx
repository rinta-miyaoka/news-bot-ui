import type { Metadata } from 'next'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'News Bot — 設定',
  description: '毎日のニュース通知を設定します',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif", background: '#f4f7fb' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
