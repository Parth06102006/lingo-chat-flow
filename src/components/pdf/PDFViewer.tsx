import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Languages, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  file: File | string | null
  onPageSelect?: (pageNumber: number) => void
  highlightPage?: number
}

interface PDFPageData {
  pageNumber: number
  language: string
  content?: string
}

// Mock page data - in real app, this would come from backend AI analysis
const mockPageData: PDFPageData[] = [
  { pageNumber: 1, language: 'English', content: 'This is the first page content in English.' },
  { pageNumber: 2, language: 'Spanish', content: 'Este es el contenido de la segunda página en español.' },
  { pageNumber: 3, language: 'French', content: 'Ceci est le contenu de la troisième page en français.' },
  { pageNumber: 4, language: 'English', content: 'This is the fourth page content in English.' },
]

export function PDFViewer({ file, onPageSelect, highlightPage }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [translationModal, setTranslationModal] = useState<{ isOpen: boolean; page: PDFPageData | null }>({
    isOpen: false,
    page: null
  })

  if (!file) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        No PDF selected
      </div>
    )
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handlePageClick = (pageNum: number) => {
    setPageNumber(pageNum)
    onPageSelect?.(pageNum)
  }

  const handleTranslate = (pageData: PDFPageData) => {
    setTranslationModal({ isOpen: true, page: pageData })
  }

  const currentPageData = mockPageData.find(p => p.pageNumber === pageNumber)

  return (
    <div className="flex flex-col h-full">
      {/* PDF Viewer Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            Page {pageNumber} of {numPages || '?'}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageClick(Math.min(numPages || 1, pageNumber + 1))}
            disabled={pageNumber >= (numPages || 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {currentPageData && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {currentPageData.language}
            </Badge>
            {currentPageData.language !== 'English' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTranslate(currentPageData)}
                className="flex items-center gap-2"
              >
                <Languages className="h-4 w-4" />
                Translate to English
              </Button>
            )}
          </div>
        )}
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="p-4">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex justify-center"
          >
            <div className={`pdf-page ${highlightPage === pageNumber ? 'ring-2 ring-primary' : ''}`}>
              <Page 
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-soft"
              />
            </div>
          </Document>
        </div>
      </div>

      {/* Page Thumbnails */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2 overflow-x-auto">
          {Array.from({ length: numPages || 0 }).map((_, index) => {
            const pageNum = index + 1
            const pageData = mockPageData.find(p => p.pageNumber === pageNum)
            
            return (
              <Card
                key={pageNum}
                className={`flex-shrink-0 p-2 cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                  pageNum === pageNumber ? 'ring-2 ring-primary' : ''
                } ${highlightPage === pageNum ? 'ring-2 ring-accent' : ''}`}
                onClick={() => handlePageClick(pageNum)}
              >
                <div className="w-16 h-20 bg-muted rounded flex items-center justify-center text-xs font-medium">
                  {pageNum}
                </div>
                {pageData && (
                  <Badge className="mt-1 text-xs" variant="secondary">
                    {pageData.language.slice(0, 2)}
                  </Badge>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Translation Modal */}
      <Dialog 
        open={translationModal.isOpen} 
        onOpenChange={(open) => setTranslationModal({ isOpen: open, page: null })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Page {translationModal.page?.pageNumber} - English Translation</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTranslationModal({ isOpen: false, page: null })}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Original ({translationModal.page?.language}):</p>
              <p className="p-3 bg-muted rounded-md">{translationModal.page?.content}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">English Translation:</p>
              <p className="p-3 bg-accent/10 border border-accent/20 rounded-md">
                {translationModal.page?.language === 'Spanish' && 'This is the content of the second page in Spanish.'}
                {translationModal.page?.language === 'French' && 'This is the content of the third page in French.'}
                {translationModal.page?.language === 'English' && translationModal.page?.content}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}