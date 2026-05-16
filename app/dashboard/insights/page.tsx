'use client'

import { useEffect, useState } from 'react'
import { FileText, Archive, Globe, Sparkles, Tag, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Note } from '@/app/lib/types'

type InsightsData = {
  totalNotes: number
  archivedNotes: number
  publicNotes: number
  aiUsageCount: number
  recentNotes: Note[]
  topTags: { tag: string; count: number }[]
  weekActivity: { day: string; date: string; count: number }[]
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/insights')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading insights...</p>
      </div>
    )
  }

  if (!data) return null

  const maxActivity = Math.max(...data.weekActivity.map(d => d.count), 1)
  const maxTagCount = Math.max(...data.topTags.map(t => t.count), 1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={15} /> Back
        </Link>
        <h1 className="text-lg font-bold">Insights</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Notes', value: data.totalNotes, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Archived', value: data.archivedNotes, icon: Archive, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Public Notes', value: data.publicNotes, icon: Globe, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'AI Generations', value: data.aiUsageCount, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border rounded-2xl p-4 space-y-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Weekly activity */}
          <div className="bg-white border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Activity</h2>
            {data.weekActivity.every(d => d.count === 0) ? (
              <p className="text-sm text-gray-400 text-center py-6">No activity this week</p>
            ) : (
              <div className="flex items-end gap-2 h-28">
                {data.weekActivity.map(({ day, count }) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{count > 0 ? count : ''}</span>
                    <div
                      className="w-full rounded-t-md bg-black transition-all"
                      style={{ height: `${(count / maxActivity) * 80}px`, minHeight: count > 0 ? '4px' : '2px', opacity: count > 0 ? 1 : 0.1 }}
                    />
                    <span className="text-xs text-gray-400">{day}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top tags */}
          <div className="bg-white border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5">
              <Tag size={14} /> Most Used Tags
            </h2>
            {data.topTags.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No tags yet</p>
            ) : (
              <div className="space-y-2.5">
                {data.topTags.map(({ tag, count }) => (
                  <div key={tag} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="font-medium">{tag}</span>
                      <span className="text-gray-400">{count} {count === 1 ? 'note' : 'notes'}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: `${(count / maxTagCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently edited */}
        <div className="bg-white border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5">
            <Clock size={14} /> Recently Edited
          </h2>
          {data.recentNotes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No notes yet</p>
          ) : (
            <div className="divide-y">
              {data.recentNotes.map(note => (
                <div key={note.id} className="py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{note.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {note.content?.slice(0, 60) || 'No content'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {note.tags?.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400">
                      {new Date(note.updated_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}