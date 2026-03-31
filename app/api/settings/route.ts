import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getSlackId(): Promise<string | null> {
  const session = await getServerSession()
  return (session?.user as { slack_id?: string })?.slack_id ?? null
}

export async function GET() {
  const slack_id = await getSlackId()
  if (!slack_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('slack_user_id', slack_id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const slack_id = await getSlackId()
  if (!slack_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      { ...body, slack_user_id: slack_id, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const slack_id = await getSlackId()
  if (!slack_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  const { error } = await supabase
    .from('user_settings')
    .delete()
    .eq('id', id)
    .eq('slack_user_id', slack_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
