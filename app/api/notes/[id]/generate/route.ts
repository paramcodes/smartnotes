import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Fetch the note
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (noteError || !note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  if (!note.content || note.content.trim().length < 20) {
    return NextResponse.json(
      { error: 'Note is too short. Add more content first.' },
      { status: 400 }
    )
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const prompt = `
You are a productivity assistant. Analyze the following note and respond ONLY with a valid JSON object — no markdown, no backticks, no explanation.

Note Title: ${note.title}
Note Content: ${note.content}

Respond with exactly this JSON shape:
{
  "summary": "2-3 sentence summary of the note",
  "action_items": ["action 1", "action 2", "action 3"],
  "suggested_title": "A concise, descriptive title"
}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Strip markdown fences if Gemini wraps in them
    const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(clean)

    // Save AI output back to the note
    const { data: updated } = await supabase
      .from('notes')
      .update({
        ai_summary: parsed.summary,
        ai_action_items: parsed.action_items,
        ai_suggested_title: parsed.suggested_title,
      })
      .eq('id', id)
      .select()
      .single()

    // Log AI usage for dashboard stats
    await supabase.from('ai_usage').insert({
      user_id: user.id,
      note_id: id,
      type: 'summary',
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Gemini error:', err)
    return NextResponse.json(
      { error: 'AI generation failed. Try again.' },
      { status: 500 }
    )
  }
}