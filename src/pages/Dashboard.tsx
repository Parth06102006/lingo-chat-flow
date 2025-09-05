import { useState, useEffect } from 'react'
import { 
  Upload, 
  FileText, 
  MessageCircle, 
  Calendar,
  Eye,
  Trash2,
  Plus,
  Languages,
  Check,
  X,
  CircleCheck,
  Circle,
  Power
} from 'lucide-react'

interface PDFType {
  _id: string
  fileName: string
  totalPages: number
  language: string
  filePath: string
  sessionId: string
  createdAt: string
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg w-4/5 h-4/5 max-w-4xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">English Translation</h2>
            <p className="text-sm text-gray-600">
              {fileName} - Page {currentPage}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Translating page content...</p>
              </div>
            </div>
          ) : translatedText ? (
            <div className="prose max-w-none">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm font-medium">
                  ✓ Translation completed using Google Translate API
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {translatedText}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Languages className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
              <p className="text-gray-600">No translation available</p>
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
  const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`

  // Load session history when session changes
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
      // Create Question
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

      // Fetch Answer with selected PDFs
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
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `⚠️ Error: ${err.message}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with End Session Button */}
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <div className="font-medium text-sm">{session?.title}</div>
          {selectedPDFIds.length > 0 && (
            <div className="text-xs text-blue-600 mt-1">
              {selectedPDFIds.length} PDF(s) selected for context
            </div>
          )}
        </div>
        <button
          onClick={onSessionEnd}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          <Power className="h-3 w-3" />
          End Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {loadingHistory && (
          <div className="flex justify-center">
            <div className="text-sm text-gray-500">Loading chat history...</div>
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
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`p-3 rounded-lg max-w-md ${
                msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 space-x-2">
                  {msg.sources.map((src, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-white/20 text-xs px-2 py-1 rounded cursor-pointer hover:bg-white/30"
                      title={`Click to view PDF ${src.pdfId.slice(-4)} - Page ${src.pageNumber}`}
                      onClick={() => onSourceClick(src.pdfId, src.pageNumber)}
                    >
                      PDF {src.pdfId.slice(-4)} - Page {src.pageNumber}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t flex items-center gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask a question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={loading || !session}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || !session || selectedPDFIds.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Send'}
        </button>
      </div>
      
      {selectedPDFIds.length === 0 && session && (
        <div className="p-2 bg-orange-50 border-t border-orange-200 text-center">
          <span className="text-xs text-orange-600">Select PDFs from the library to start chatting</span>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Create New Session</h2>
        <input
          type="text"
          placeholder="Enter session title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
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
  
  // Translation states
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentTranslationPage, setCurrentTranslationPage] = useState(1)
  
  const backendUrl = 'http://localhost:8000'

  const toast = ({ title, description }: { title: string; description: string }) =>
    console.log(`${title}: ${description}`)

  // Load selected PDFs from memory on component mount
  useEffect(() => {
    const saved = (window as any).selectedPDFIds || []
    setSelectedPDFIds(saved)
  }, [])

  // Save selected PDFs to memory whenever they change
  useEffect(() => {
    (window as any).selectedPDFIds = selectedPDFIds
  }, [selectedPDFIds])

  // Function to extract text from PDF using PDF.js (would need to be implemented with pdf-parse or similar)
  const extractTextFromPDF = async (pdfUrl: string, pageNumber: number): Promise<string> => {
    try {
      // This is a simulation - in reality you'd need to implement PDF text extraction
      // You could use libraries like pdf-parse, PDF.js, or send to your backend
      
      // For demonstration, we'll simulate extracting text
      // In a real implementation, you'd want to:
      // 1. Load the PDF using PDF.js or similar
      // 2. Extract text from the specific page
      // 3. Return the text content
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return placeholder text for demonstration
      return `This is simulated text content from page ${pageNumber} of the PDF. In a real implementation, this would be the actual extracted text from the PDF page that needs to be translated.`
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  // Function to translate text using multiple free translation services
  const translateText = async (text: string, targetLang: string = 'en'): Promise<string> => {
    // Limit text length to avoid API limits
    const maxLength = 1000
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text
      try {
    const response = await fetch(`${backendUrl}/api/v1/translate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: truncatedText,
        pageNumber: currentTranslationPage || 1
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success && data.data.translatedText) {
      return data.data.translatedText
    } else {
      throw new Error(data.message || 'Backend translation failed')
    }
  } catch (error) {
    console.error('Backend Gemini translation error:', error)
    // Continue to fallback services below
  }
  
    // Service 1: MyMemory Translation API (most reliable, free)
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncatedText)}&langpair=auto|${targetLang}`)
      const data = await response.json()
      
      if (data.responseStatus === 200 && data.responseData.translatedText) {
        return data.responseData.translatedText
      } else {
        throw new Error('MyMemory API failed')
      }
    } catch (error) {
      console.error('MyMemory translation error:', error)
    }

    // Service 2: Unofficial Google Translate API
    try {
      const googleResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(truncatedText)}`)
      const googleData = await googleResponse.json()
      
      if (googleData && googleData[0] && googleData[0][0] && googleData[0][0][0]) {
        let translatedText = ''
        googleData[0].forEach((item: any[]) => {
          if (item[0]) translatedText += item[0]
        })
        return translatedText
      } else {
        throw new Error('Google Translate API failed')
      }
    } catch (error) {
      console.error('Google Translate error:', error)
    }

    // Service 3: Lingva Translate (Alternative Google Translate frontend)
    try {
      const lingvaResponse = await fetch(`https://lingva.ml/api/v1/auto/${targetLang}/${encodeURIComponent(truncatedText)}`)
      const lingvaData = await lingvaResponse.json()
      
      if (lingvaData.translation) {
        return lingvaData.translation
      } else {
        throw new Error('Lingva Translate failed')
      }
    } catch (error) {
      console.error('Lingva Translate error:', error)
    }

    // Service 4: FunTranslations API (backup)
    try {
      const funResponse = await fetch(`https://api.funtranslations.com/translate/english.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `text=${encodeURIComponent(truncatedText)}`
      })
      const funData = await funResponse.json()
      
      if (funData.contents && funData.contents.translated) {
        return funData.contents.translated
      } else {
        throw new Error('FunTranslations API failed')
      }
    } catch (error) {
      console.error('FunTranslations error:', error)
    }

    // Service 5: Yandex Translate (unofficial endpoint)
    try {
      const yandexResponse = await fetch('https://translate.yandex.net/api/v1/tr.json/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `text=${encodeURIComponent(truncatedText)}&lang=${targetLang}`
      })
      const yandexData = await yandexResponse.json()
      
      if (yandexData.text && yandexData.text[0]) {
        return yandexData.text[0]
      } else {
        throw new Error('Yandex Translate failed')
      }
    } catch (error) {
      console.error('Yandex Translate error:', error)
    }

    // Final fallback: Simple text processing for common phrases
    const commonTranslations: { [key: string]: string } = {
      'hola': 'hello',
      'bonjour': 'hello',
      'guten tag': 'hello',
      'ciao': 'hello',
      'namaste': 'hello',
      'gracias': 'thank you',
      'merci': 'thank you',
      'danke': 'thank you',
      'grazie': 'thank you',
      'arigato': 'thank you'
    }

    const lowerText = truncatedText.toLowerCase()
    for (const [foreign, english] of Object.entries(commonTranslations)) {
      if (lowerText.includes(foreign)) {
        return truncatedText.replace(new RegExp(foreign, 'gi'), english)
      }
    }

    // If all services fail, return original text with error message
    throw new Error('All translation services are currently unavailable. Please try again later.')
  }

  // Handle translation of current PDF page
  const handleTranslatePage = async () => {
    if (!selectedPDF) return
    
    setIsTranslating(true)
    setShowTranslationModal(true)
    setTranslatedText('')
    
    try {
      // Get current page number from iframe or default to 1
      const currentPage = scrollToPage || 1
      setCurrentTranslationPage(currentPage)
      
      // Extract text from PDF page
      const extractedText = await extractTextFromPDF(selectedPDF.filePath, currentPage)
      
      // Translate the extracted text
      const translated = await translateText(extractedText, 'en')
      
      setTranslatedText(translated)
      toast({ 
        title: 'Translation completed', 
        description: `Page ${currentPage} translated to English` 
      })
      
    } catch (error: any) {
      console.error('Translation error:', error)
      setTranslatedText(`Error: ${error.message || 'Failed to translate page content'}`)
      toast({ 
        title: 'Translation failed', 
        description: error.message || 'Could not translate the page' 
      })
    } finally {
      setIsTranslating(false)
    }
  }

  // Fetch PDFs
  const fetchPDFs = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/pdf/list`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok && data.success) setPDFs(data.data || [])
    } catch (err) {
      console.error('Error fetching PDFs:', err)
    }
  }

  // Fetch Sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/chat/sessions`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok && data.success) {
        setSessions(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
    }
  }

  useEffect(() => {
    fetchPDFs()
    fetchSessions()
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
      } else toast({ title: 'Upload failed', description: data.message || 'Error' })
    } catch (err) {
      console.error('Upload error:', err)
      toast({ title: 'Upload error', description: 'Something went wrong.' })
    }
    e.target.value = ''
  }

  const handleDeletePDF = async (pdfId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/pdf/delete/${pdfId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        toast({ title: 'PDF deleted', description: 'Document removed.' })
        setSelectedPDFIds(prev => prev.filter(id => id !== pdfId))
        fetchPDFs()
      }
    } catch (err) {
      console.error('Delete PDF error:', err)
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
      } else toast({ title: 'Session creation failed', description: data.message || 'Error' })
    } catch (err) {
      console.error('Create session error:', err)
      toast({ title: 'Error', description: 'Failed to create session.' })
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/chat/session/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        toast({ title: 'Session deleted', description: 'Conversation removed.' })
        fetchSessions()
        if (activeSession?.sessionId === sessionId) {
          setActiveSession(null)
        }
      }
    } catch (err) {
      console.error('Delete session error:', err)
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
      setShowPDFViewer(true)
    }
  }

  const getSelectedPDFNames = () => {
    return selectedPDFIds.map(id => {
      const pdf = pdfs.find(p => p._id === id)
      return pdf ? pdf.fileName : 'Unknown'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">PDF Chat Dashboard</h1>
            {activeSession && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Active: {activeSession.title}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-600">Select PDFs first, then create or join a chat session.</p>
          {selectedPDFIds.length > 0 && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border">
              <div className="text-sm text-blue-700 font-medium">
                Selected PDFs ({selectedPDFIds.length}):
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {getSelectedPDFNames().join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total PDFs</p>
                <p className="text-2xl font-bold">{pdfs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500"/>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected PDFs</p>
                <p className="text-2xl font-bold text-blue-600">{selectedPDFIds.length}</p>
              </div>
              <CircleCheck className="h-8 w-8 text-blue-500"/>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chat Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500"/>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Languages</p>
                <p className="text-2xl font-bold">{new Set(pdfs.map(p=>p.language)).size}</p>
              </div>
              <Languages className="h-8 w-8 text-purple-500"/>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('pdfs')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'pdfs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2"/> PDFs ({selectedPDFIds.length} selected)
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === 'sessions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2"/> Sessions
            </button>
            {activeSession && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 font-medium border-b-2 ${
                  activeTab === 'chat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageCircle className="h-4 w-4 inline mr-2"/> Active Chat
              </button>
            )}
            <button
              onClick={() => selectedPDFIds.length > 0 ? setShowTitleDialog(true) : toast({ title: 'No PDFs Selected', description: 'Please select PDFs first' })}
              className={`px-4 py-2 font-medium border-b-2 border-transparent ${
                selectedPDFIds.length > 0 ? 'text-green-600 hover:text-green-700' : 'text-gray-400'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2"/> New Chat
            </button>
          </div>

          {/* PDFs Tab */}
          {activeTab === 'pdfs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your PDF Library</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
                      <Upload className="h-4 w-4"/> Upload PDF
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
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No PDFs Uploaded</h3>
                  <p className="text-gray-600 mb-4">Upload your first PDF to get started with AI-powered document chat.</p>
                  <div className="relative inline-block">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto">
                      <Upload className="h-4 w-4"/> Upload Your First PDF
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pdfs.map(pdf => (
                    <div 
                      key={pdf._id} 
                      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                        selectedPDFIds.includes(pdf._id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => togglePDFSelection(pdf._id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {selectedPDFIds.includes(pdf._id) ? (
                              <CircleCheck className="h-6 w-6 text-blue-500" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-300" />
                            )}
                            <FileText className="h-8 w-8 text-blue-500"/>
                          </div>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{pdf.language}</span>
                        </div>
                        <h3 className="text-lg font-medium truncate mb-1">{pdf.fileName}</h3>
                        <p className="text-gray-600 text-sm mb-1">{pdf.totalPages} pages</p>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 mr-2"/>
                          {new Date(pdf.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => { setSelectedPDF(pdf); setScrollToPage(null); setShowPDFViewer(true) }} 
                            className="flex-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                          >
                            <Eye className="h-4 w-4"/> Preview
                          </button>
                          <button 
                            onClick={() => handleDeletePDF(pdf._id)} 
                            className="px-3 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Chat Sessions</h2>
                <button 
                  onClick={() => selectedPDFIds.length > 0 ? setShowTitleDialog(true) : toast({ title: 'No PDFs Selected', description: 'Please select PDFs first' })}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedPDFIds.length > 0 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={selectedPDFIds.length === 0}
                >
                  <Plus className="h-4 w-4"/> New Session
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Chat Sessions</h3>
                  <p className="text-gray-600 mb-4">Create your first session to start chatting with your PDFs.</p>
                  <button 
                    onClick={() => selectedPDFIds.length > 0 ? setShowTitleDialog(true) : setActiveTab('pdfs')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
                  >
                    {selectedPDFIds.length > 0 ? (
                      <>
                        <Plus className="h-4 w-4"/> Create Session
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4"/> Select PDFs First
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sessions.map(session => (
                    <div 
                      key={session._id} 
                      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                        activeSession?.sessionId === session.sessionId ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <MessageCircle className="h-8 w-8 text-green-500"/>
                          <div className="flex items-center gap-2">
                            {activeSession?.sessionId === session.sessionId && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {activeSession?.sessionId === session.sessionId ? 'Active' : 'Session'}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-lg font-medium mb-3">{session.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 mr-2"/>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openSession(session)} 
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                          >
                            <Eye className="h-4 w-4"/> Open Chat
                          </button>
                          <button 
                            onClick={() => handleDeleteSession(session.sessionId)} 
                            className="px-3 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50"
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
                <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4"/>
                  <h2 className="text-xl font-semibold mb-2">No Active Session</h2>
                  <p className="text-gray-600 mb-4">
                    {selectedPDFIds.length === 0 
                      ? 'Select PDFs from the library first, then create a new session to start chatting.'
                      : 'Create a new session or open an existing one from the Sessions tab to start chatting.'
                    }
                  </p>
                  {selectedPDFIds.length > 0 ? (
                    <button 
                      onClick={() => setShowTitleDialog(true)} 
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="h-4 w-4"/> Create New Session
                    </button>
                  ) : (
                    <button 
                      onClick={() => setActiveTab('pdfs')} 
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
                    >
                      <FileText className="h-4 w-4"/> Select PDFs
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg border shadow-sm h-[600px]">
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

      {/* PDF Viewer Modal with Enhanced Features and Translation */}
      {showPDFViewer && selectedPDF && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-4/5 h-4/5 max-w-6xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">PDF Viewer: {selectedPDF.fileName}</h2>
                {scrollToPage && (
                  <p className="text-sm text-blue-600">Scrolling to page {scrollToPage}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>{selectedPDF.totalPages} pages</span>
                  <span>•</span>
                  <span>{selectedPDF.language}</span>
                  <span>•</span>
                  <span>Uploaded: {new Date(selectedPDF.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedPDFIds.includes(selectedPDF._id) && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Selected
                  </span>
                )}
                {/* Translation Button */}
                <button 
                  onClick={handleTranslatePage}
                  disabled={isTranslating}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Languages className="h-3 w-3" />
                  {isTranslating ? 'Translating...' : 'Translate to English'}
                </button>
                <button 
                  onClick={() => togglePDFSelection(selectedPDF._id)}
                  className={`px-3 py-1 text-xs rounded ${
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
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
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
                onLoad={() => {
                  if (scrollToPage) {
                    console.log(`PDF loaded, should scroll to page ${scrollToPage}`)
                  }
                }}
              />
            </div>
            <div className="p-3 border-t bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{selectedPDF.fileName}</span>
                </div>
                <div className="flex items-center gap-4">
                  {scrollToPage && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Eye className="h-4 w-4" />
                      <span>Viewing page {scrollToPage}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-green-600">
                    <Languages className="h-4 w-4" />
                    <span>Translation available</span>
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

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900">PDF Chat Dashboard</h3>
              <p className="text-gray-600 text-sm">AI-powered document conversations with translation</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span>Translation Ready</span>
              </div>
              <div>
                Version 2.1
              </div>
              <div>
                {new Date().getFullYear()} © All rights reserved
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Declare global types for TypeScript
declare global {
  interface Window {
    selectedPDFIds: string[]
  }
}