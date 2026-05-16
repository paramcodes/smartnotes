'use client'

import { useState } from 'react'
import { Note } from '@/app/lib/types'
import { Sparkles, CheckSquare, Lightbulb, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  note: Note
  onUpdated: (note: Note) => void
}

export default function AIPanel({ note, onUpdated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(true)

  const hasAI = note.ai_summary || note.ai_action_items || note.ai_suggested_title

  async function generate() {
    setLoading(true)
    setError('')

    const res = await fetch(`/api/notes/${note.id}/generate`, {
      method: 'POST'
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
    } else {
      onUpdated(data)
    }

    setLoading(false)
  }

  async function applyTitle() {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: note.ai_suggested_title })
    })
    const updated = await res.json()
    onUpdated(updated)
  }

  return (
    <div className="border-t bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Sparkles size={15} className="text-purple-500" />
          AI Assistant
          {hasAI && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full dark:bg-purple-900/30 dark:text-purple-300">
              Generated
            </span>
          )}
        </div>
        {open ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 w-full justify-center"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
              : <><Sparkles size={14} /> {hasAI ? 'Regenerate' : 'Generate AI insights'}</>
            }
          </button>

          {/* Suggested Title */}
          {note.ai_suggested_title && (
            <div className="bg-white border rounded-xl p-3 space-y-1.5 dark:bg-gray-900 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                <Lightbulb size={12} className="text-yellow-500" />
                Suggested Title
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-800 font-medium dark:text-gray-200">{note.ai_suggested_title}</p>
                <button
                  onClick={applyTitle}
                  className="text-xs text-purple-600 hover:underline shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Summary */}
          {note.ai_summary && (
            <div className="bg-white border rounded-xl p-3 space-y-1.5 dark:bg-gray-900 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                <Sparkles size={12} className="text-purple-500" />
                Summary
              </div>
              <p className="text-sm text-gray-700 leading-relaxed dark:text-gray-300">{note.ai_summary}</p>
            </div>
          )}

          {/* Action Items */}
          {note.ai_action_items && note.ai_action_items.length > 0 && (
            <div className="bg-white border rounded-xl p-3 space-y-1.5 dark:bg-gray-900 dark:border-gray-700">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                <CheckSquare size={12} className="text-green-500" />
                Action Items
              </div>
              <ul className="space-y-1.5">
                {note.ai_action_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-0.5 w-4 h-4 rounded border border-gray-300 flex items-center justify-center shrink-0 text-xs text-gray-400 dark:border-gray-600 dark:text-gray-500">
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
    </div>
  )
}