import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const supabase = await createClient()
  const { shareId } = await params

  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single()

  if (error || !note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  return NextResponse.json(note)
}