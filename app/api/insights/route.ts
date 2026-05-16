import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all notes
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  // Fetch AI usage
  const { data: aiUsage } = await supabase
    .from('ai_usage')
    .select('*')
    .eq('user_id', user.id)

  if (!notes) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  // Total counts
  const totalNotes = notes.filter(n => !n.is_archived).length
  const archivedNotes = notes.filter(n => n.is_archived).length
  const publicNotes = notes.filter(n => n.is_public).length
  const aiUsageCount = aiUsage?.length || 0

  // Recently edited (top 5 non-archived)
  const recentNotes = notes
    .filter(n => !n.is_archived)
    .slice(0, 5)

  // Most used tags
  const tagCount: Record<string, number> = {}
  notes.forEach(note => {
    note.tags?.forEach((tag: string) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }))

  // Weekly activity — notes edited in last 7 days grouped by day
  const today = new Date()
  const weekActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const count = notes.filter(n => n.updated_at.startsWith(dateStr)).length
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: dateStr,
      count
    }
  })

  return NextResponse.json({
    totalNotes,
    archivedNotes,
    publicNotes,
    aiUsageCount,
    recentNotes,
    topTags,
    weekActivity,
  })
}