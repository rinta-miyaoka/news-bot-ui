import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserSettings = {
  id?: string
  user_name: string
  slack_webhook_url: string
  keywords: string[]
  categories: string[]
  language: 'ja' | 'en' | 'both'
  schedule: string
  max_articles: number
  source_urls: string[]
  updated_at?: string
}
