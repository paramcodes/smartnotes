import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-4xl">🔒</p>
        <h1 className="text-xl font-bold text-gray-800">Note not found</h1>
        <p className="text-sm text-gray-500">
          This note is private or doesn't exist.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 text-sm text-black font-medium hover:underline"
        >
          Go to Peblo Notes →
        </Link>
      </div>
    </div>
  )
}