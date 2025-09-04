import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Mic, FileText, Bot, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: { pdf: string; pages: number[] }[]
}

interface ChatInterfaceProps {
  onPageReference?: (pdfName: string, pageNumber: number) => void
}

// Mock chat data
const mockMessages: Message[] = [
  {
    id: '1',
    type: 'user',
    content: 'What are the main topics covered in the research paper?',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: '2',
    type: 'assistant',
    content: 'Based on the uploaded research paper, the main topics covered include machine learning algorithms for natural language processing, specifically focusing on transformer architectures and their applications in multilingual text analysis. The paper also discusses evaluation methodologies and performance benchmarks.',
    timestamp: new Date(Date.now() - 240000),
    sources: [
      { pdf: 'research-paper.pdf', pages: [1, 3, 7] },
      { pdf: 'methodology.pdf', pages: [12, 15] }
    ]
  }
]

export function ChatInterface({ onPageReference }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Mock AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I understand your question. Based on the documents you\'ve uploaded, I can provide relevant information with specific page references for verification.',
        timestamp: new Date(),
        sources: [
          { pdf: 'document.pdf', pages: [2, 5] }
        ]
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    // In real app, implement Web Speech API here
  }

  const handlePageClick = (pdfName: string, pageNumber: number) => {
    onPageReference?.(pdfName, pageNumber)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="chat-message"
            >
              <Card className={`p-4 max-w-[80%] ${
                message.type === 'user' 
                  ? 'ml-auto bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={message.type === 'user' ? 'bg-primary-foreground text-primary' : 'bg-accent text-accent-foreground'}>
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.sources && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {source.pdf}
                              </Badge>
                              <div className="flex gap-1">
                                {source.pages.map(page => (
                                  <Button
                                    key={page}
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs hover:underline"
                                    onClick={() => handlePageClick(source.pdf, page)}
                                  >
                                    p.{page}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your PDFs..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="pr-10"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceInput}
            className={`flex-shrink-0 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
          >
            <Mic className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleSend} 
            disabled={!input.trim()}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}