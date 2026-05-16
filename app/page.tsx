import Link from 'next/link'
import { FileText, Sparkles, Globe, BarChart2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b dark:border-gray-800">
        <span className="text-lg font-bold dark:text-white">📝 Peblo Notes</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-80"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full font-medium mb-6">
          AI-powered notes workspace
        </span>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white max-w-2xl leading-tight">
          Notes that think <span className="text-purple-500">with</span> you
        </h1>
        <p className="mt-5 text-gray-500 dark:text-gray-400 text-lg max-w-xl">
          Write freely. Let AI summarize, extract action items, and suggest titles — all saved automatically and shareable in one click.
        </p>
        <div className="flex items-center gap-3 mt-8">
          <Link
            href="/signup"
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-sm font-medium hover:opacity-80"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="border dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Log in
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 pb-20 max-w-4xl mx-auto w-full">
        {[
          {
            icon: FileText,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            title: 'Smart Notes',
            desc: 'Auto-save, tags, categories, and archive — everything organised.'
          },
          {
            icon: Sparkles,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/30',
            title: 'AI Insights',
            desc: 'Summaries, action items, and title suggestions powered by Gemini.'
          },
          {
            icon: Globe,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/30',
            title: 'Public Sharing',
            desc: 'Share any note publicly with a single link — no login needed.'
          },
          {
            icon: BarChart2,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/30',
            title: 'Insights',
            desc: 'Track your writing activity, top tags, and AI usage over time.'
          },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 text-left space-y-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 pb-6">
        Built in India ❤️

      </footer>

    </div>
  )
}