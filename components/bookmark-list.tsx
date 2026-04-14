"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Bookmark } from "@/lib/types"
import { BookmarkItem } from "./bookmark-item"
import { Bookmark as BookmarkIcon, Sparkles } from "lucide-react"

export function BookmarkList({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark
          setBookmarks((prev) => {
            if (prev.some((b) => b.id === newBookmark.id)) return prev
            return [newBookmark, ...prev]
          })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
        },
        (payload) => {
          const deletedId = payload.old.id as string
          setBookmarks((prev) => prev.filter((b) => b.id !== deletedId))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center bg-card rounded-2xl border border-dashed border-border">
        <div className="flex items-center justify-center size-14 sm:size-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
          <BookmarkIcon className="size-7 sm:size-8 text-primary" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold mb-1 text-foreground">No bookmarks yet</h3>
        <p className="text-muted-foreground text-sm max-w-[260px] mb-4">
          Add your first bookmark above to start building your collection
        </p>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <Sparkles className="size-3.5" />
          <span>Tip: You can also import bookmarks from a CSV file</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {bookmarks.map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
