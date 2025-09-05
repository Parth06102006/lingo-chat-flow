import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: { pdfId: string; pageNumber: number }[]
}

interface ChatInterfaceProps {
  session: { sessionId: string; title: string } | null
  selectedPDFs?: string[]
}

export default function ChatInterface({ session, selectedPDFs = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const backendUrl = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:8000'
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send Question + Fetch Answer
  const handleSend = async () => {
    if (!input.trim() || !session) return
    const questionText = input.trim()
    setInput("")

    // Push user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: questionText,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setLoading(true)

    try {
      // 1. Create Question
      const qRes = await fetch(`${backendUrl}/api/v1/chat/question`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          sessionId: session.sessionId,
          title: session.title,
        }),
      })
      
      const qData = await qRes.json()
      console.log('Question response:', qData) // Debug log
      
      if (!qRes.ok || !qData.success) {
        throw new Error(qData.message || "Question failed")
      }

      const questionId = qData.data._id

      // 2. Fetch Answer
      const aRes = await fetch(`${backendUrl}/api/v1/chat/answer`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          sessionId: session.sessionId,
          pdfIds: selectedPDFs, // Now uses the selected PDFs from props
          title: session.title,
        }),
      })
      
      const aData = await aRes.json()
      console.log('Answer response:', aData) // Debug log
      
      if (!aRes.ok || !aData.success) {
        throw new Error(aData.message || "Answer failed")
      }

      // 3. Push assistant message
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: aData.data.answerText,
        timestamp: new Date(),
        sources: aData.data.sources || [],
      }
      setMessages((prev) => [...prev, newAssistantMessage])
    } catch (err) {
      console.error("Chat Error:", err)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "assistant",
          content: `⚠️ Error: ${err.message}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      {/* Selected PDFs Display */}
      {selectedPDFs.length > 0 && (
        <div className="p-3 bg-blue-50 border-b">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Selected PDFs ({selectedPDFs.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedPDFs.map((pdfId, index) => (
              <span key={pdfId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                PDF {index + 1} ({pdfId.slice(-6)})
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">
              {selectedPDFs.length > 0 
                ? `Ask questions about your ${selectedPDFs.length} selected PDF${selectedPDFs.length > 1 ? 's' : ''}`
                : 'Ask any question or select PDFs for document-specific answers'
              }
            </p>
          </div>
        )}
        
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            } animate-in slide-in-from-bottom-2 duration-200`}
          >
            {msg.type === 'assistant' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div className={`p-3 rounded-lg max-w-md ${
              msg.type === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 space-x-2">
                  {msg.sources.map((src, idx) => (
                    <span key={idx} className="inline-block bg-white/20 text-xs px-2 py-1 rounded">
                      PDF {src.pdfId.slice(-4)} - Page {src.pageNumber}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {msg.type === 'user' && (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t flex items-center gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            selectedPDFs.length > 0 
              ? "Ask a question about your selected PDFs..." 
              : "Ask a question..."
          }
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || !session}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Status indicator */}
      {selectedPDFs.length === 0 && (
        <div className="px-3 py-2 bg-yellow-50 border-t border-yellow-200 text-center">
          <p className="text-xs text-yellow-700">
            💡 No PDFs selected - answers will be general AI responses
          </p>
        </div>
      )}
    </div>
  )
}