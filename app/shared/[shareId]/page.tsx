import { createClient } from '@/app/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Tag, Sparkles, CheckSquare, Calendar } from 'lucide-react'

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params
  const supabase = await createClient()

  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single()

  if (error || !note) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">📝 Peblo Notes</span>
        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
          Public Note
        </span>
      </div>

      {/* Note content */}
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{note.title || 'Untitled'}</h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(note.updated_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
            {note.category && (
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">{note.category}</span>
            )}
          </div>
        </div>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag: string) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-white border text-xs px-2.5 py-1 rounded-full text-gray-600"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="bg-white border rounded-2xl p-6">
          {note.content ? (
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>
          ) : (
            <p className="text-gray-400 text-sm italic">No content.</p>
          )}
        </div>

        {/* AI Section */}
        {(note.ai_summary || note.ai_action_items?.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Sparkles size={15} className="text-purple-500" />
              AI Insights
            </div>

            {note.ai_summary && (
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1.5">
                  Summary
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{note.ai_summary}</p>
              </div>
            )}

            {note.ai_action_items?.length > 0 && (
              <div className="bg-white border rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <CheckSquare size={12} className="text-green-500" />
                  Action Items
                </div>
                <ul className="space-y-2">
                  {note.ai_action_items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-0.5 w-4 h-4 rounded border border-gray-300 flex items-center justify-center shrink-0 text-xs text-gray-400">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-300 pt-4">
          Shared via Peblo Notes
        </p>
      </div>
    </div>
  )
}