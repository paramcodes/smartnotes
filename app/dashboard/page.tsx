'use client'

import { useEffect, useState, useCallback } from 'react'
import { Note } from '@/app/lib/types'
import {
  Plus, Search, Archive, Trash2, Tag,
  FileText, LayoutDashboard, LogOut, X, Sun, Moon
} from 'lucide-react'
import { useTheme } from '../components/ThemeProvider'
import NoteEditor from '@/app/components/NoteEditor'
import Link from 'next/link'

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allTags, setAllTags] = useState<string[]>([])
  const { theme, toggle } = useTheme()

  const fetchNotes = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterTag) params.set('tag', filterTag)
    if (showArchived) params.set('archived', 'true')

    const res = await fetch(`/api/notes?${params}`)
    const data = await res.json()
    setNotes(data)

    // Collect all unique tags
    const tags = new Set<string>()
    data.forEach((n: Note) => n.tags?.forEach((t: string) => tags.add(t)))
    setAllTags(Array.from(tags))

    setLoading(false)
  }, [search, filterTag, showArchived])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  async function createNote() {
    const res = await fetch('/api/notes', { method: 'POST' })
    const note = await res.json()
    setNotes(prev => [note, ...prev])
    setSelectedNote(note)
  }

  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
  }

  async function archiveNote(id: string) {
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: true })
    })
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
  }

  async function unarchiveNote(id: string) {
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: false })
    })
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
  }

  function onNoteUpdated(updated: Note) {
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
    setSelectedNote(updated)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">📝 Peblo Notes</h1>
        </div>

        <div className="p-3 space-y-1">
          <button
            onClick={() => { setShowArchived(false); setFilterTag('') }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 ${!showArchived ? 'bg-gray-100 dark:bg-gray-800 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <FileText size={15} /> All Notes
          </button>
          <button
            onClick={() => { setShowArchived(true); setFilterTag('') }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 ${showArchived ? 'bg-gray-100 dark:bg-gray-800 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Archive size={15} /> Archived
          </button>
          <Link
            href="/dashboard/insights"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LayoutDashboard size={15} /> Insights
          </Link>
        </div>

        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="px-3 mt-2">
            <p className="text-xs text-gray-500 font-medium px-2 mb-1 dark:text-gray-400">TAGS</p>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 ${filterTag === tag ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <Tag size={12} /> {tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto p-3 border-t dark:border-gray-700 space-y-1">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <form action="/auth/signout" method="POST">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
              <LogOut size={15} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Notes list */}
      <div className="w-72 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
        <div className="p-3 border-b dark:border-gray-700 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5">
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={createNote}
              className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>
          {filterTag && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              Filtered by: <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">{filterTag}</span>
              <button onClick={() => setFilterTag('')}><X size={12} /></button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
              {search ? 'No notes found' : 'No notes yet. Create one!'}
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 group ${selectedNote?.id === note.id ? 'bg-gray-50 border-l-2 border-l-black dark:bg-gray-800 dark:border-l-white' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium truncate flex-1 text-gray-900 dark:text-gray-200">{note.title || 'Untitled'}</p>
                  <div className="hidden group-hover:flex items-center gap-1 ml-1">
                    <button
                      onClick={e => { e.stopPropagation(); showArchived ? unarchiveNote(note.id) : archiveNote(note.id) }}
                      className="p-1 hover:bg-gray-200 rounded dark:hover:bg-gray-700"
                      title={showArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive size={12} className="text-gray-500" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                      className="p-1 hover:bg-red-100 rounded dark:hover:bg-red-900/30"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {note.content?.replace(/\s+/g, ' ').slice(0, 60) || 'No content'}
                </p>
                {note.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(note.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onUpdated={onNoteUpdated}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}