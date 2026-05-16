'use client'

import { useState, useEffect, useCallback } from 'react'
import { Note } from '@/app/lib/types'
import { Tag, X, Globe, Lock, Share2 } from 'lucide-react'
import AIPanel from '@/app/components/AIPanel'

interface Props {
  note: Note
  onUpdated: (note: Note) => void
}

export default function NoteEditor({ note, onUpdated }: Props) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState<string[]>(note.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [shareUrl, setShareUrl] = useState('')

  // Sync local state when note prop changes (e.g. AI applies a new title)
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags || [])
  }, [note.id, note.ai_suggested_title, note.title])

  // Auto-save with debounce — waits 1 second after you stop typing
  const save = useCallback(async (data: Partial<Note>) => {
    setSaving(true)
    const res = await fetch(`/api/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const updated = await res.json()
    onUpdated(updated)
    setSaving(false)
    setSaved(true)
  }, [note.id, onUpdated])

  useEffect(() => {
    setSaved(false)
    const timer = setTimeout(() => {
      save({ title, content, tags })
    }, 1000)
    return () => clearTimeout(timer)
  }, [title, content, tags, save])

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  async function togglePublic() {
    const updated = await fetch(`/api/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: !note.is_public })
    }).then(r => r.json())
    onUpdated(updated)
  }

  function copyShareUrl() {
    const url = `${window.location.origin}/shared/${note.share_id}`
    navigator.clipboard.writeText(url)
    setShareUrl(url)
    setTimeout(() => setShareUrl(''), 3000)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {saving ? 'Saving...' : saved ? 'Saved' : 'Unsaved'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePublic}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${note.is_public ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:border-gray-700'}`}
          >
            {note.is_public ? <Globe size={13} /> : <Lock size={13} />}
            {note.is_public ? 'Public' : 'Private'}
          </button>
          {note.is_public && (
            <button
              onClick={copyShareUrl}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:border-gray-700"
            >
              <Share2 size={13} />
              {shareUrl ? 'Copied!' : 'Copy link'}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Untitled"
        className="text-2xl font-bold px-6 pt-6 pb-2 focus:outline-none placeholder-gray-300 bg-transparent text-gray-900 dark:text-white dark:placeholder-gray-600"
      />

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 px-6 pb-3">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Tag size={10} />
            {tag}
            <button onClick={() => removeTag(tag)}><X size={10} /></button>
          </span>
        ))}
        <input
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
          }}
          placeholder="Add tag..."
          className="text-xs border rounded-full px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-black w-24 bg-white text-gray-900 placeholder:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Start writing..."
        className="flex-1 px-6 py-2 resize-none focus:outline-none text-sm leading-relaxed text-gray-700 bg-transparent dark:text-gray-300 dark:placeholder-gray-600"
      />
      {/* AI Panel */}
      <AIPanel note={note} onUpdated={onUpdated} />
    </div>
  )
}