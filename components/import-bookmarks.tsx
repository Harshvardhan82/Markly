"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Upload, X, FileSpreadsheet, Check, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ImportBookmarksProps {
  userId: string
}

export function ImportBookmarks({ userId }: ImportBookmarksProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [urlColumn, setUrlColumn] = useState<string>("")
  const [titleColumn, setTitleColumn] = useState<string>("")
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim())
    return lines.map(line => {
      const result: string[] = []
      let current = ""
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      
      if (parsed.length > 0) {
        setHeaders(parsed[0])
        setCsvData(parsed.slice(1))
        setUrlColumn("")
        setTitleColumn("")
        setImportResult(null)
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!urlColumn || !titleColumn) return

    setIsImporting(true)
    setImportResult(null)

    const urlIndex = headers.indexOf(urlColumn)
    const titleIndex = headers.indexOf(titleColumn)

    const supabase = createClient()
    let success = 0
    let failed = 0

    const bookmarksToInsert = csvData
      .filter(row => row[urlIndex] && row[titleIndex])
      .map(row => ({
        url: row[urlIndex],
        title: row[titleIndex],
        user_id: userId,
      }))

    for (const bookmark of bookmarksToInsert) {
      try {
        const urlToInsert = bookmark.url.startsWith('http') 
          ? bookmark.url 
          : `https://${bookmark.url}`
        
        const { error } = await supabase.from("bookmarks").insert({
          ...bookmark,
          url: urlToInsert,
        })
        
        if (error) {
          failed++
        } else {
          success++
        }
      } catch {
        failed++
      }
    }

    setImportResult({ success, failed })
    setIsImporting(false)
  }

  const resetState = () => {
    setCsvData([])
    setHeaders([])
    setUrlColumn("")
    setTitleColumn("")
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetState()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 h-9 text-xs sm:text-sm px-3 border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
        >
          <Upload className="size-4" />
          <span className="hidden sm:inline">Import CSV</span>
          <span className="sm:hidden">Import</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <FileSpreadsheet className="size-4 text-primary" />
            </div>
            Import Bookmarks
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {csvData.length === 0 ? (
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className="flex items-center justify-center size-14 rounded-full bg-primary/20">
                  <Upload className="size-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">Upload your CSV file</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click to browse or drag and drop your file here
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <>
              {/* File Info */}
              <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-accent/20">
                    <FileSpreadsheet className="size-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{csvData.length} rows found</p>
                    <p className="text-xs text-muted-foreground">{headers.length} columns detected</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={resetState}
                  aria-label="Remove file"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Column Selection */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="flex items-center justify-center size-5 rounded bg-accent/20 text-xs font-bold text-accent">1</span>
                    URL Column
                  </label>
                  <Select value={urlColumn} onValueChange={setUrlColumn}>
                    <SelectTrigger className="h-11 rounded-xl border-border focus:border-primary focus:ring-primary/20">
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="flex items-center justify-center size-5 rounded bg-primary/20 text-xs font-bold text-primary">2</span>
                    Title Column
                  </label>
                  <Select value={titleColumn} onValueChange={setTitleColumn}>
                    <SelectTrigger className="h-11 rounded-xl border-border focus:border-primary focus:ring-primary/20">
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              {csvData.length > 0 && urlColumn && titleColumn && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="text-xs font-semibold text-muted-foreground bg-muted px-4 py-2.5 flex items-center gap-2">
                    <Check className="size-3.5 text-success" />
                    Preview (first 3 rows)
                  </div>
                  <div className="divide-y divide-border">
                    {csvData.slice(0, 3).map((row, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-muted/50 transition-colors">
                        <p className="text-sm font-medium text-foreground truncate">
                          {row[headers.indexOf(titleColumn)] || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {row[headers.indexOf(urlColumn)] || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className={`flex items-center gap-3 p-3 rounded-xl ${
                  importResult.failed > 0 
                    ? "bg-warning/10 border border-warning/20" 
                    : "bg-success/10 border border-success/20"
                }`}>
                  {importResult.failed > 0 ? (
                    <AlertCircle className="size-5 text-warning shrink-0" />
                  ) : (
                    <Check className="size-5 text-success shrink-0" />
                  )}
                  <span className="text-sm font-medium">
                    Successfully imported {importResult.success} bookmarks
                    {importResult.failed > 0 && (
                      <span className="text-warning"> ({importResult.failed} failed)</span>
                    )}
                  </span>
                </div>
              )}

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={!urlColumn || !titleColumn || isImporting}
                className="w-full h-12 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all hover:shadow-lg"
              >
                {isImporting ? (
                  <>
                    <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Importing bookmarks...
                  </>
                ) : (
                  <>
                    <Upload className="size-4 mr-2" />
                    Import {csvData.length} Bookmarks
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
