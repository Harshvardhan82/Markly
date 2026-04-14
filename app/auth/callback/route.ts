import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Return HTML that closes popup and redirects parent
      const html = `
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Successful</title></head>
          <body>
            <script>
              if (window.opener) {
                window.close();
              } else {
                window.location.href = '${origin}/dashboard';
              }
            </script>
            <p>Authentication successful. Redirecting...</p>
          </body>
        </html>
      `
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      })
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
