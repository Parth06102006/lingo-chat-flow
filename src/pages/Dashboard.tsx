'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth/AuthContext'
import { Upload, FileText, MessageCircle, Calendar, Eye, Trash2, Plus, Languages, Check, X, CircleCheck, Circle, Power, User, LogOut } from 'lucide-react'

interface PDFType {
  _id: string
  fileName: string
  totalPages: number
  language: string
  filePath: string
  sessionId: string
  createdAt: string
  text?: Array<{
    pageNumber: number
    content: string
  }>
}

interface SessionType {
  _id: string
  sessionId: string
  title: string
  createdAt: string
}

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: { pdfId: string; pageNumber: number }[]
}

interface Question {
  _id: string
  question: string
  answer?: string
  createdAt: string
  sources?: { pdfId: string; pageNumber: number }[]
}

// Translation Modal Component
function TranslationModal({ 
  isOpen, 
  onClose, 
  translatedText, 
  isLoading,
  currentPage,
  fileName 
}: { 
  isOpen: boolean
  onClose: () => void
  translatedText: string
  isLoading: boolean
  currentPage: number
  fileName: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-2xl w-full h-full sm:w-4/5 sm:h-4/5 max-w-4xl flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">English Translation</h2>
            <p className="text-xs sm:text-sm text-slate-600 truncate">
              {fileName} - Page {currentPage}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/30">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600">Translating page content...</p>
              </div>
            </div>
          ) : translatedText ? (
            <div className="prose max-w-none">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
                <p className="text-green-800 text-sm font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Translation completed using Google Translate API
                </p>
              </div>
              <div className="bg-white border border-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md">
                <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base text-slate-700 leading-relaxed">
                  {translatedText}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Languages className="h-16 w-16 text-blue-200 mx-auto mb-4"/>
              <p className="text-slate-500">No translation available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple Chat Interface Component
function ChatInterface({ 
  session, 
  selectedPDFIds, 
  onSessionEnd,
  onSourceClick
}: { 
  session: SessionType | null
  selectedPDFIds: string[]
  onSessionEnd: () => void
  onSourceClick: (pdfId: string, pageNumber: number) => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const backendUrl = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    if (session) {
      loadSessionHistory(session.sessionId)
    } else {
      setMessages([])
    }
  }, [session])

  const loadSessionHistory = async (sessionId: string) => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`${backendUrl}/api/v1/chat/history/${sessionId}`, {
        credentials: 'include'
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const history: Question[] = data.data || []
        const historyMessages: Message[] = []
        
        history.forEach((item, index) => {
          historyMessages.push({
            id: `user-${index}`,
            type: 'user',
            content: item.question,
            timestamp: new Date(item.createdAt)
          })
          
          if (item.answer) {
            historyMessages.push({
              id: `assistant-${index}`,
              type: 'assistant',
              content: item.answer,
              timestamp: new Date(item.createdAt),
              sources: item.sources || []
            })
          }
        })
        
        setMessages(historyMessages)
      }
    } catch (err) {
      console.error('Error loading session history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !session) return
    const questionText = input.trim()
    setInput('')

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: questionText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newUserMessage])
    setLoading(true)

    try {
      const qRes = await fetch(`${backendUrl}/api/v1/chat/question`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          sessionId: session.sessionId,
          title: session.title,
        }),
      })
      const qData = await qRes.json()
      if (!qRes.ok || !qData.success) throw new Error(qData.message || 'Question failed')
      const questionId = qData.data._id

      const aRes = await fetch(`${backendUrl}/api/v1/chat/answer`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          sessionId: session.sessionId,
          pdfIds: selectedPDFIds,
          title: session.title,
        }),
      })
      const aData = await aRes.json()
      if (!aRes.ok || !aData.success) throw new Error(aData.message || 'Answer failed')

      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aData.data.answerText,
        timestamp: new Date(),
        sources: aData.data.sources || [],
      }
      setMessages(prev => [...prev, newAssistantMessage])
  } catch (err: unknown) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
        content: `⚠️ Error: ${err instanceof Error ? err.message : 'Request failed'}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm sm:text-base text-slate-900 truncate">{session?.title}</div>
          {selectedPDFIds.length > 0 && (
            <div className="text-xs text-blue-600 mt-1 font-medium">
              {selectedPDFIds.length} PDF(s) selected for context
            </div>
          )}
        </div>
        <button
          onClick={onSessionEnd}
          className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 whitespace-nowrap"
        >
          <Power className="h-3 w-3" />
          <span className="hidden sm:inline">End Session</span>
          <span className="sm:hidden">End</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-[300px]">
        {loadingHistory && (
          <div className="flex justify-center">
            <div className="text-sm text-slate-500">Loading chat history...</div>
          </div>
        )}
        
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.type === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`p-2.5 sm:p-3 rounded-lg max-w-[85%] sm:max-w-md ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                  : 'bg-gray-100 text-slate-900 rounded-bl-none border border-blue-100'
              }`}
            >
              <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 space-x-2">
                  {msg.sources.map((src, idx) => (
                    <span
                      key={idx}
                      className={`inline-block text-xs px-2 py-1 rounded cursor-pointer transition-all duration-200 ${
                        msg.type === 'user'
                          ? 'bg-white/20 hover:bg-white/30'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      title={`Click to view PDF ${src.pdfId.slice(-4)} - Page ${src.pageNumber}`}
                      onClick={() => onSourceClick(src.pdfId, src.pageNumber)}
                    >
                      📄 Page {src.pageNumber}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div className="p-3 rounded-lg bg-gray-100 text-slate-900 border border-blue-100">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 border-t border-blue-100 bg-gradient-to-r from-blue-50/50 to-purple-50/30 flex items-center gap-2">
        <input
          className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white text-slate-900 transition-all duration-200"
          placeholder="Ask a question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={loading || !session}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || !session || selectedPDFIds.length === 0}
          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md font-medium text-sm sm:text-base whitespace-nowrap"
        >
          {loading ? 'Loading...' : 'Send'}
        </button>
      </div>
      
      {selectedPDFIds.length === 0 && session && (
        <div className="p-3 bg-amber-50 border-t border-amber-200 text-center">
          <span className="text-xs text-amber-700 font-medium">📁 Select PDFs from the library to start chatting</span>
        </div>
      )}
    </div>
  )
}

// Title Input Dialog Component
function TitleInputDialog({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string) => void
}) {
  const [title, setTitle] = useState('')
  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim())
      setTitle('')
      onClose()
    }
  }
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:w-96 shadow-2xl">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Create New Session</h2>
        <input
          type="text"
          placeholder="Enter session title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent mb-4 text-slate-900 transition-all duration-200"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-600 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 font-medium"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [pdfs, setPDFs] = useState<PDFType[]>([])
  const [sessions, setSessions] = useState<SessionType[]>([])
  const [selectedPDF, setSelectedPDF] = useState<PDFType | null>(null)
  const [activeSession, setActiveSession] = useState<SessionType | null>(null)
  const [selectedPDFIds, setSelectedPDFIds] = useState<string[]>([])
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const [showTitleDialog, setShowTitleDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'pdfs' | 'sessions' | 'chat'>('pdfs')
  const [scrollToPage, setScrollToPage] = useState<number | null>(null)
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
  
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentTranslationPage, setCurrentTranslationPage] = useState(1)
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const { toast } = useToast()
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const globalWindow = window as unknown as { selectedPDFIds?: string[] }
    const saved = globalWindow.selectedPDFIds || []
    setSelectedPDFIds(saved)
  }, [])

  useEffect(() => {
    const globalWindow = window as unknown as { selectedPDFIds?: string[] }
    globalWindow.selectedPDFIds = selectedPDFIds
  }, [selectedPDFIds])

  const extractTextFromPDF = async (pdfId: string, pageNumber: number): Promise<string> => {
    try {
      // Get the PDF data we already have
      const pdf = pdfs.find(p => p._id === pdfId)
      if (!pdf) {
        throw new Error('PDF not found')
      }

      // Find the page text
      const pageData = pdf.text?.find(p => p.pageNumber === pageNumber)
      if (!pageData || !pageData.content) {
        throw new Error(`Page ${pageNumber} content not found`)
      }

      return pageData.content
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  const translateText = async (pdfId: string, pageNumber: number, text: string): Promise<string> => {
    const response = await fetch(`${backendUrl}/api/v1/translate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfId,
        pageNumber,
        text
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success && data.data.translatedText) {
      return data.data.translatedText
    } else {
      throw new Error(data.message || 'Backend translation failed')
    }
  }

  const handleTranslatePage = async () => {
    if (!selectedPDF) return
    
    setIsTranslating(true)
    setShowTranslationModal(true)
    setTranslatedText('')
    
    try {
      // Use currentPageNumber if available, otherwise use scrollToPage or default to 1
      const currentPage = currentPageNumber || scrollToPage || 1
      setCurrentTranslationPage(currentPage)
      
      // Extract text from the PDF page
      const extractedText = await extractTextFromPDF(selectedPDF._id, currentPage)
      
      // Translate using backend
      const translated = await translateText(selectedPDF._id, currentPage, extractedText)
      
      setTranslatedText(translated)
      toast({ 
        title: 'Translation completed', 
        description: `Page ${currentPage} translated to English` 
      })
      
    } catch (error: unknown) {
      console.error('Translation error:', error)
      setTranslatedText(`Error: ${error instanceof Error ? error.message : 'Failed to translate page content'}`)
      toast({ 
        title: 'Translation failed', 
        description: error instanceof Error ? error.message : 'Could not translate the page',
        variant: 'destructive'
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const fetchPDFs = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/pdf/list`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok && data.success) {
        setPDFs(data.data || [])
      } else {
        toast({ title: 'Failed to fetch PDFs', description: data?.message || 'Try again later', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Network error', description: 'Could not load PDFs', variant: 'destructive' })
    }
  }

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/chat/sessions`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok && data.success) {
        setSessions(data.data || [])
      } else {
        toast({ title: 'Failed to fetch sessions', description: data?.message || 'Try again later', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Network error', description: 'Could not load sessions', variant: 'destructive' })
    }
  }

  useEffect(() => {
    fetchPDFs()
    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    const formData = new FormData()
    formData.append('pdfFile', files[0])
    formData.append('sessionId', '')
    toast({ title: 'Upload started', description: `Uploading ${files[0].name}` })

    try {
      const res = await fetch(`${backendUrl}/api/v1/pdf/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: 'Upload successful', description: 'PDF uploaded.' })
        fetchPDFs()
      } else toast({ title: 'Upload failed', description: data?.message || 'Error', variant: 'destructive' })
    } catch (err) {
      toast({ title: 'Upload error', description: 'Something went wrong.', variant: 'destructive' })
    }
    e.target.value = ''
  }

  const handleDeletePDF = async (pdfId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/pdf/delete/${pdfId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: 'PDF deleted', description: 'Document removed.' })
        setSelectedPDFIds(prev => prev.filter(id => id !== pdfId))
        fetchPDFs()
      } else {
        toast({ title: 'Delete failed', description: data?.message || 'Could not delete PDF', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Network error', description: 'Delete request failed', variant: 'destructive' })
    }
  }

  const togglePDFSelection = (pdfId: string) => {
    setSelectedPDFIds(prev => 
      prev.includes(pdfId) 
        ? prev.filter(id => id !== pdfId)
        : [...prev, pdfId]
    )
  }

  const handleNewSessionWithTitle = async (title: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/chat/session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title,
          pdfIds: selectedPDFIds
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: 'New session created', description: 'Start chatting now.' })
        fetchSessions()
        setActiveSession(data.data)
        setActiveTab('chat')
      } else toast({ title: 'Session creation failed', description: data?.message || 'Error', variant: 'destructive' })
    } catch (err) {
      toast({ title: 'Network error', description: 'Failed to create session.', variant: 'destructive' })
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/chat/session/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: 'Session deleted', description: 'Conversation removed.' })
        fetchSessions()
        if (activeSession?.sessionId === sessionId) {
          setActiveSession(null)
        }
      } else {
        toast({ title: 'Delete failed', description: data?.message || 'Could not delete session', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'Network error', description: 'Delete request failed', variant: 'destructive' })
    }
  }

  const handleSessionEnd = () => {
    setActiveSession(null)
    setActiveTab('pdfs')
  }

  const openSession = (session: SessionType) => {
    setActiveSession(session)
    setActiveTab('chat')
  }

  const handleSourceClick = (pdfId: string, pageNumber: number) => {
    const pdf = pdfs.find(p => p._id === pdfId)
    if (pdf) {
      setSelectedPDF(pdf)
      setScrollToPage(pageNumber)
      setCurrentPageNumber(pageNumber)
      setShowPDFViewer(true)
    }
  }

  const getSelectedPDFNames = () => {
    return selectedPDFIds.map(id => {
      const pdf = pdfs.find(p => p._id === id)
      return pdf ? pdf.fileName : 'Unknown'
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      <header className="bg-white/70 backdrop-blur-md border-b border-blue-100 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/logo.jpg" 
                alt="LingoDocs Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shadow-md"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LingoDocs</h1>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {activeSession && (
                <div className="flex items-center gap-2 text-xs sm:text-sm bg-green-50 px-2 sm:px-3 py-1 rounded-full border border-green-200 shadow-md">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium truncate">{activeSession.title}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-blue-700 truncate max-w-[100px] sm:max-w-none">{user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-all duration-200 font-medium shadow-sm text-xs sm:text-sm"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome back!</h2>
          <p className="text-sm sm:text-base text-slate-600">Select PDFs first, then create or join a chat session to get started.</p>
          {selectedPDFIds.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 shadow-md">
              <div className="text-sm text-blue-900 font-semibold">
                ✓ Selected PDFs ({selectedPDFIds.length})
              </div>
              <div className="text-xs text-blue-700 mt-2 flex flex-wrap gap-2">
                {getSelectedPDFNames().map((name, idx) => (
                  <span key={idx} className="bg-blue-100 px-2 py-1 rounded-full">📄 {name}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-blue-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Total PDFs</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{pdfs.length}</p>
              </div>
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 opacity-20"/>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-blue-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Selected</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{selectedPDFIds.length}</p>
              </div>
              <CircleCheck className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 opacity-20"/>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-blue-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Chat Sessions</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{sessions.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 opacity-20"/>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-blue-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Languages</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">{new Set(pdfs.map(p=>p.language)).size}</p>
              </div>
              <Languages className="h-8 w-8 sm:h-10 sm:w-10 text-purple-500 opacity-20"/>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex overflow-x-auto border-b border-blue-100 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
            <button
              onClick={() => setActiveTab('pdfs')}
              className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold border-b-2 transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'pdfs' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2"/> PDFs ({selectedPDFIds.length})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold border-b-2 transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'sessions' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2"/> Sessions
            </button>
            {activeSession && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold border-b-2 transition-all duration-200 whitespace-nowrap text-sm sm:text-base ${
                  activeTab === 'chat' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2"/> Active Chat
              </button>
            )}
            <button
              onClick={() => selectedPDFIds.length > 0 ? setShowTitleDialog(true) : toast({ title: 'No PDFs Selected', description: 'Please select PDFs first' })}
              className={`px-3 sm:px-4 py-2 sm:py-3 font-semibold border-b-2 transition-all duration-200 ml-auto whitespace-nowrap text-sm sm:text-base ${
                selectedPDFIds.length > 0 
                  ? 'border-transparent text-green-600 hover:text-green-700' 
                  : 'border-transparent text-slate-400'
              }`}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1 sm:mr-2"/> <span className="hidden sm:inline">New Chat</span><span className="sm:hidden">New</span>
            </button>
          </div>

          {/* PDFs Tab */}
          {activeTab === 'pdfs' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Your PDF Library</h2>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 shadow-md font-medium transition-all duration-200 text-sm sm:text-base">
                      <Upload className="h-4 w-4"/> <span className="hidden sm:inline">Upload PDF</span><span className="sm:hidden">Upload</span>
                    </button>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {pdfs.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-100 shadow-md px-4">
                  <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-blue-200 mx-auto mb-4"/>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No PDFs Uploaded Yet</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-6">Upload your first PDF to start chatting with AI about your documents</p>
                  <div className="relative inline-block">
                    <button className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto shadow-md font-medium transition-all duration-200 text-sm sm:text-base">
                      <Upload className="h-4 w-4"/> <span className="hidden sm:inline">Upload Your First PDF</span><span className="sm:hidden">Upload PDF</span>
                    </button>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pdfs.map(pdf => (
                    <div 
                      key={pdf._id} 
                      className={`bg-white rounded-2xl border shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        selectedPDFIds.includes(pdf._id) 
                          ? 'ring-2 ring-blue-600 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50' 
                          : 'border-blue-100 hover:border-blue-300'
                      }`}
                      onClick={() => togglePDFSelection(pdf._id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {selectedPDFIds.includes(pdf._id) ? (
                              <CircleCheck className="h-6 w-6 text-blue-600" />
                            ) : (
                              <Circle className="h-6 w-6 text-slate-300" />
                            )}
                            <FileText className="h-8 w-8 text-blue-600"/>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">{pdf.language}</span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 truncate mb-1">{pdf.fileName}</h3>
                        <p className="text-slate-700 text-sm mb-1">📄 {pdf.totalPages} pages</p>
                        <div className="flex items-center text-xs text-slate-500 mb-4">
                          <Calendar className="h-4 w-4 mr-1"/>
                          {new Date(pdf.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => { 
                              setSelectedPDF(pdf); 
                              setScrollToPage(null); 
                              setCurrentPageNumber(1);
                              setShowPDFViewer(true) 
                            }} 
                            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm hover:bg-blue-50 flex items-center justify-center gap-1 transition-all duration-200 text-blue-700 font-medium"
                          >
                            <Eye className="h-4 w-4"/> Preview
                          </button>
                          <button 
                            onClick={() => handleDeletePDF(pdf._id)} 
                            className="px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Chat Sessions</h2>
                <button 
                  onClick={() => selectedPDFIds.length > 0 ? setShowTitleDialog(true) : toast({ title: 'No PDFs Selected', description: 'Please select PDFs first' })}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md transition-all duration-200 text-sm sm:text-base ${
                    selectedPDFIds.length > 0 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' 
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                  disabled={selectedPDFIds.length === 0}
                >
                  <Plus className="h-4 w-4"/> <span className="hidden sm:inline">New Session</span><span className="sm:hidden">New Session</span>
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-100 shadow-md px-4">
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-200 mx-auto mb-4"/>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">No Chat Sessions Yet</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-6">Create your first session to start having conversations with your PDFs</p>
                  <button 
                    onClick={() => selectedPDFIds.length > 0 ? setShowTitleDialog(true) : setActiveTab('pdfs')}
                    className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto shadow-md font-medium transition-all duration-200 text-sm sm:text-base"
                  >
                    {selectedPDFIds.length > 0 ? (
                      <>
                        <Plus className="h-4 w-4"/> <span className="hidden sm:inline">Create Session</span><span className="sm:hidden">Create</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4"/> <span className="hidden sm:inline">Select PDFs First</span><span className="sm:hidden">Select PDFs</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessions.map(session => (
                    <div 
                      key={session._id} 
                      className={`bg-white rounded-2xl border shadow-md hover:shadow-lg transition-all duration-300 ${
                        activeSession?.sessionId === session.sessionId 
                          ? 'ring-2 ring-green-500 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                          : 'border-blue-100 hover:border-blue-300'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <MessageCircle className="h-8 w-8 text-green-600"/>
                          <div className="flex items-center gap-2">
                            {activeSession?.sessionId === session.sessionId && (
                              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-700 font-semibold">Active</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 mb-3">{session.title}</h3>
                        <div className="flex items-center text-xs text-slate-500 mb-4">
                          <Calendar className="h-4 w-4 mr-1"/>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openSession(session)} 
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 transition-all duration-200 font-medium"
                          >
                            <Eye className="h-4 w-4"/> Open
                          </button>
                          <button 
                            onClick={() => handleDeleteSession(session.sessionId)} 
                            className="px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div>
              {!activeSession ? (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-blue-100 shadow-md p-6 sm:p-12 text-center">
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-blue-200 mx-auto mb-4"/>
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No Active Session</h2>
                  <p className="text-sm sm:text-base text-slate-600 mb-6">
                    {selectedPDFIds.length === 0 
                      ? 'Select PDFs from the library first, then create a session to start chatting.'
                      : 'Create a new session or open an existing one from the Sessions tab.'}
                  </p>
                  {selectedPDFIds.length > 0 ? (
                    <button 
                      onClick={() => setShowTitleDialog(true)} 
                      className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto shadow-md font-medium transition-all duration-200 text-sm sm:text-base"
                    >
                      <Plus className="h-4 w-4"/> <span className="hidden sm:inline">Create New Session</span><span className="sm:hidden">Create Session</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setActiveTab('pdfs')} 
                      className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto shadow-md font-medium transition-all duration-200 text-sm sm:text-base"
                    >
                      <FileText className="h-4 w-4"/> Select PDFs
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-blue-100 shadow-md h-[500px] sm:h-[600px] overflow-hidden">
                  <ChatInterface 
                    session={activeSession} 
                    selectedPDFIds={selectedPDFIds}
                    onSessionEnd={handleSessionEnd}
                    onSourceClick={handleSourceClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <TitleInputDialog 
        isOpen={showTitleDialog} 
        onClose={() => setShowTitleDialog(false)} 
        onSubmit={handleNewSessionWithTitle}
      />

      {/* PDF Viewer Modal */}
      {showPDFViewer && selectedPDF && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-2xl w-full h-full sm:w-4/5 sm:h-4/5 max-w-6xl flex flex-col shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 truncate">PDF Viewer: {selectedPDF.fileName}</h2>
                {(currentPageNumber || scrollToPage) && (
                  <p className="text-xs sm:text-sm text-blue-700 font-medium">
                    Viewing page {currentPageNumber || scrollToPage} of {selectedPDF.totalPages}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs text-slate-600">
                  <span className="font-medium">📄 {selectedPDF.totalPages} pages</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-medium">{selectedPDF.language}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>📅 {new Date(selectedPDF.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                {selectedPDFIds.includes(selectedPDF._id) && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                    ✓ Selected
                  </span>
                )}
                <button 
                  onClick={handleTranslatePage}
                  disabled={isTranslating}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-200 font-medium shadow-md flex-1 sm:flex-none"
                >
                  <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{isTranslating ? 'Translating...' : 'Translate'}</span>
                  <span className="sm:hidden">{isTranslating ? '...' : 'Translate'}</span>
                </button>
                <button 
                  onClick={() => togglePDFSelection(selectedPDF._id)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs rounded-lg transition-all duration-200 font-medium flex-1 sm:flex-none ${
                    selectedPDFIds.includes(selectedPDF._id)
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {selectedPDFIds.includes(selectedPDF._id) ? 'Deselect' : 'Select'}
                </button>
                <button 
                  onClick={() => { 
                    setShowPDFViewer(false); 
                    setScrollToPage(null); 
                  }} 
                  className="text-slate-400 hover:text-slate-600 p-2 rounded hover:bg-gray-100 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-100">
              <iframe 
                src={scrollToPage 
                  ? `${selectedPDF.filePath}#page=${scrollToPage}` 
                  : selectedPDF.filePath
                } 
                className="w-full h-full border-0" 
                title="PDF Viewer"
                onLoad={(e) => {
                  // Extract page number from iframe URL if available
                  const iframe = e.target as HTMLIFrameElement
                  try {
                    const url = new URL(iframe.src)
                    const pageParam = url.hash.match(/page=(\d+)/)
                    if (pageParam) {
                      const pageNum = parseInt(pageParam[1], 10)
                      setCurrentPageNumber(pageNum)
                      setScrollToPage(pageNum)
                    } else {
                      setCurrentPageNumber(1)
                    }
                  } catch (err) {
                    // If URL parsing fails, try to get from hash directly
                    const hashMatch = iframe.src.match(/#page=(\d+)/)
                    if (hashMatch) {
                      const pageNum = parseInt(hashMatch[1], 10)
                      setCurrentPageNumber(pageNum)
                      setScrollToPage(pageNum)
                    } else {
                      setCurrentPageNumber(1)
                    }
                  }
                }}
              />
            </div>
            <div className="p-2 sm:p-3 border-t border-blue-100 bg-gradient-to-r from-blue-50/50 to-purple-50/30">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium truncate flex-1 min-w-0">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{selectedPDF.fileName}</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {(currentPageNumber || scrollToPage) && (
                  <div className="flex items-center gap-1 text-blue-700 font-medium">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    Page {currentPageNumber || scrollToPage}
                  </div>
                )}
                  <div className="flex items-center gap-1 text-green-700 font-medium">
                    <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Translation ready</span>
                    <span className="sm:hidden">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Translation Modal */}
      <TranslationModal 
        isOpen={showTranslationModal}
        onClose={() => setShowTranslationModal(false)}
        translatedText={translatedText}
        isLoading={isTranslating}
        currentPage={currentTranslationPage}
        fileName={selectedPDF?.fileName || ''}
      />

      <footer className="bg-white border-t border-blue-100 mt-8 sm:mt-16 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 sm:gap-0">
            <div className="mb-0 sm:mb-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <img 
                  src="/logo.jpg" 
                  alt="LingoDocs Logo" 
                  className="w-8 h-8 rounded-lg object-cover shadow-md"
                />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">LingoDocs</h3>
                  <p className="text-xs text-slate-600 font-medium">Break Every Language Barrier</p>
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-600">
              Made By Parth
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

declare global {
  interface Window {
    selectedPDFIds: string[]
  }
}
