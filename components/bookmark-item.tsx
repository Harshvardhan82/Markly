"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Bookmark } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trash2, X, Check } from "lucide-react"

interface BookmarkItemProps {
  bookmark: Bookmark
  onDelete: (id: string) => void
}

export function BookmarkItem({ bookmark, onDelete }: BookmarkItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmark.id)

    if (!error) {
      onDelete(bookmark.id)
    }
    
    setIsDeleting(false)
    setShowConfirm(false)
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  const faviconUrl = getFaviconUrl(bookmark.url)

  return (
    <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200">
      {/* Favicon with colored background */}
      <div className="flex items-center justify-center size-10 sm:size-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 shrink-0 overflow-hidden">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            alt=""
            className="size-5 sm:size-6"
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        ) : (
          <ExternalLink className="size-5 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm sm:text-base font-semibold text-foreground hover:text-primary transition-colors truncate"
        >
          {bookmark.title}
        </a>
        <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
          {bookmark.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {showConfirm ? (
          <div className="flex items-center gap-1 bg-destructive/10 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirm(false)}
              className="size-8 hover:bg-background"
              disabled={isDeleting}
              aria-label="Cancel delete"
            >
              <X className="size-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              className="size-8"
              disabled={isDeleting}
              aria-label="Confirm delete"
            >
              {isDeleting ? (
                <div className="size-3 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="size-8 sm:size-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-accent/20 hover:text-accent"
            >
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" aria-label="Open link">
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirm(true)}
              className="size-8 sm:size-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete bookmark"
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
