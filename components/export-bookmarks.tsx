"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Download, Check } from "lucide-react"
import { useState } from "react"

export function ExportBookmarks() {
  const [isExporting, setIsExporting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { data: bookmarks, error } = await supabase
        .from("bookmarks")
        .select("title, url, created_at")
        .order("created_at", { ascending: false })

      if (error) throw error

      if (!bookmarks || bookmarks.length === 0) {
        alert("No bookmarks to export")
        setIsExporting(false)
        return
      }

      // Create CSV content
      const headers = ["Title", "URL", "Created At"]
      const csvRows = [
        headers.join(","),
        ...bookmarks.map((b) =>
          [
            `"${(b.title || "").replace(/"/g, '""')}"`,
            `"${(b.url || "").replace(/"/g, '""')}"`,
            `"${b.created_at}"`,
          ].join(",")
        ),
      ]
      const csvContent = csvRows.join("\n")

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `markly-bookmarks-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export bookmarks")
    }

    setIsExporting(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 h-9 text-xs sm:text-sm px-3 transition-all ${
        success 
          ? "border-success/50 bg-success/10 text-success hover:bg-success/20" 
          : "border-accent/30 hover:bg-accent/10 hover:text-accent hover:border-accent/50"
      }`}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <div className="size-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      ) : success ? (
        <Check className="size-4" />
      ) : (
        <Download className="size-4" />
      )}
      <span className="hidden sm:inline">{success ? "Downloaded!" : "Export CSV"}</span>
      <span className="sm:hidden">{success ? "Done" : "Export"}</span>
    </Button>
  )
}
