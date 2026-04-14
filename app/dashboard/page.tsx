import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AddBookmarkForm } from "@/components/add-bookmark-form"
import { BookmarkList } from "@/components/bookmark-list"
import { ImportBookmarks } from "@/components/import-bookmarks"
import { ExportBookmarks } from "@/components/export-bookmarks"
import { Layers } from "lucide-react"
import type { Bookmark } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect("/login")
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false })

  const bookmarkCount = (bookmarks as Bookmark[] | null)?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Add Bookmark Section */}
          <AddBookmarkForm userId={user.id} />

          {/* Bookmarks List Section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-accent/10">
                  <Layers className="size-4 text-accent" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold">Your Bookmarks</h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {bookmarkCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ImportBookmarks userId={user.id} />
                <ExportBookmarks />
              </div>
            </div>
            <BookmarkList initialBookmarks={(bookmarks as Bookmark[]) || []} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 text-center text-xs sm:text-sm text-muted-foreground border-t border-border">
        <span className="font-medium">Markly</span> - Your bookmarks, everywhere
      </footer>
    </div>
  )
}
