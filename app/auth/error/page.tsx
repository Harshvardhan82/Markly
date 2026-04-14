import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bookmark } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground">
            <Bookmark className="w-5 h-5 text-background" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Markly</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Authentication Error</h1>
            <p className="text-muted-foreground">
              Something went wrong during sign in. Please try again.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
