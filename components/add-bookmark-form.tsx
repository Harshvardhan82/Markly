"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Link as LinkIcon, Type, Check, Sparkles } from "lucide-react"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"

export function AddBookmarkForm({ userId }: { userId: string }) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const trimmedUrl = url.trim()
    const trimmedTitle = title.trim()

    if (!trimmedUrl) {
      setError("URL is required")
      return
    }

    if (!validateUrl(trimmedUrl)) {
      setError("Please enter a valid URL (e.g., https://example.com)")
      return
    }

    if (!trimmedTitle) {
      setError("Title is required")
      return
    }

    setIsLoading(true)

    const supabase = createClient()
    const { error: insertError } = await supabase.from("bookmarks").insert({
      url: trimmedUrl,
      title: trimmedTitle,
      user_id: userId,
    })

    setIsLoading(false)

    if (insertError) {
      setError("Failed to add bookmark. Please try again.")
      return
    }

    setUrl("")
    setTitle("")
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <Sparkles className="size-4 text-primary" />
        </div>
        <h2 className="text-base sm:text-lg font-semibold">Add New Bookmark</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="url" className="text-sm font-medium">Website URL</FieldLabel>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 size-8 rounded-md bg-accent/10 flex items-center justify-center">
                <LinkIcon className="size-4 text-accent" />
              </div>
              <Input
                id="url"
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError(null)
                }}
                className="pl-14 h-11 sm:h-12 text-sm sm:text-base rounded-xl border-border focus:border-primary focus:ring-primary/20"
                autoComplete="off"
              />
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="title" className="text-sm font-medium">Bookmark Title</FieldLabel>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 size-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Type className="size-4 text-primary" />
              </div>
              <Input
                id="title"
                type="text"
                placeholder="My favorite website"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setError(null)
                }}
                className="pl-14 h-11 sm:h-12 text-sm sm:text-base rounded-xl border-border focus:border-primary focus:ring-primary/20"
                autoComplete="off"
              />
            </div>
          </Field>
        </FieldGroup>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs sm:text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full h-11 sm:h-12 text-sm sm:text-base font-semibold gap-2 rounded-xl shadow-md transition-all hover:shadow-lg ${
            success 
              ? "bg-success text-success-foreground hover:bg-success/90" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isLoading ? (
            <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : success ? (
            <Check className="size-5" />
          ) : (
            <Plus className="size-5" />
          )}
          {isLoading ? "Adding bookmark..." : success ? "Bookmark added!" : "Add Bookmark"}
        </Button>
      </form>
    </div>
  )
}
