import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in and trying to access protected routes → redirect to login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = new URL('/login', request.url)
    const redirectResponse = NextResponse.redirect(url)
    const sc = supabaseResponse.cookies.getAll ? supabaseResponse.cookies.getAll() : []
    sc.forEach(c => {
      const cookie: any = c
      const opts: Record<string, any> = {}
      if (cookie.maxAge !== undefined) opts.maxAge = cookie.maxAge
      if (cookie.expires !== undefined) opts.expires = cookie.expires
      if (cookie.httpOnly !== undefined) opts.httpOnly = cookie.httpOnly
      if (cookie.path !== undefined) opts.path = cookie.path
      if (cookie.sameSite !== undefined) opts.sameSite = cookie.sameSite
      if (cookie.secure !== undefined) opts.secure = cookie.secure
      redirectResponse.cookies.set(cookie.name, cookie.value, opts)
    })
    return redirectResponse
  }

  // If logged in and trying to access login/signup → redirect to dashboard
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  )) {
    const url = new URL('/dashboard', request.url)
    const redirectResponse = NextResponse.redirect(url)
    const sc = supabaseResponse.cookies.getAll ? supabaseResponse.cookies.getAll() : []
    sc.forEach(c => {
      const cookie: any = c
      const opts: Record<string, any> = {}
      if (cookie.maxAge !== undefined) opts.maxAge = cookie.maxAge
      if (cookie.expires !== undefined) opts.expires = cookie.expires
      if (cookie.httpOnly !== undefined) opts.httpOnly = cookie.httpOnly
      if (cookie.path !== undefined) opts.path = cookie.path
      if (cookie.sameSite !== undefined) opts.sameSite = cookie.sameSite
      if (cookie.secure !== undefined) opts.secure = cookie.secure
      redirectResponse.cookies.set(cookie.name, cookie.value, opts)
    })
    return redirectResponse
  }

  // If logged in and visiting home → go to dashboard
  if (user && request.nextUrl.pathname === '/') {
    const url = new URL('/dashboard', request.url)
    const redirectResponse = NextResponse.redirect(url)
    const sc = supabaseResponse.cookies.getAll ? supabaseResponse.cookies.getAll() : []
    sc.forEach(c => {
      const cookie: any = c
      const opts: Record<string, any> = {}
      if (cookie.maxAge !== undefined) opts.maxAge = cookie.maxAge
      if (cookie.expires !== undefined) opts.expires = cookie.expires
      if (cookie.httpOnly !== undefined) opts.httpOnly = cookie.httpOnly
      if (cookie.path !== undefined) opts.path = cookie.path
      if (cookie.sameSite !== undefined) opts.sameSite = cookie.sameSite
      if (cookie.secure !== undefined) opts.secure = cookie.secure
      redirectResponse.cookies.set(cookie.name, cookie.value, opts)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|shared).*)'],
}