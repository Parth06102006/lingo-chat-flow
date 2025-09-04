import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Header } from '@/components/layout/Header'
import { PDFViewer } from '@/components/pdf/PDFViewer'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { 
  Upload, 
  FileText, 
  MessageCircle, 
  Calendar,
  Eye,
  Trash2,
  Plus,
  Clock,
  Languages
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext'
import { Navigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

// Mock data
const mockPDFs = [
  {
    id: '1',
    name: 'research-paper.pdf',
    pages: 24,
    language: 'English',
    uploadDate: new Date('2024-01-15'),
    size: '2.4 MB'
  },
  {
    id: '2', 
    name: 'spanish-document.pdf',
    pages: 12,
    language: 'Spanish',
    uploadDate: new Date('2024-01-14'),
    size: '1.8 MB'
  },
  {
    id: '3',
    name: 'french-manual.pdf',
    pages: 36,
    language: 'French', 
    uploadDate: new Date('2024-01-13'),
    size: '4.2 MB'
  }
]

const mockSessions = [
  {
    id: '1',
    title: 'Research Paper Analysis',
    createdAt: new Date('2024-01-15T10:30:00'),
    messagesCount: 12,
    lastActivity: new Date('2024-01-15T14:22:00')
  },
  {
    id: '2',
    title: 'Translation Questions',
    createdAt: new Date('2024-01-14T15:45:00'),
    messagesCount: 8,
    lastActivity: new Date('2024-01-14T16:30:00')
  },
  {
    id: '3',
    title: 'Technical Documentation Review',
    createdAt: new Date('2024-01-13T09:15:00'),
    messagesCount: 15,
    lastActivity: new Date('2024-01-13T11:45:00')
  }
]

const Dashboard = () => {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // Mock upload - in real app, this would upload to backend
      toast({
        title: "Upload started",
        description: `Uploading ${files[0].name}...`,
      })
      
      // Simulate upload success
      setTimeout(() => {
        toast({
          title: "Upload successful",
          description: "Your PDF has been processed and is ready for analysis.",
        })
      }, 2000)
    }
  }

  const handlePDFView = (pdfId: string) => {
    setSelectedPDF(pdfId)
    setShowPDFViewer(true)
  }

  const handleSessionView = (sessionId: string) => {
    setSelectedSession(sessionId)
    setShowChatInterface(true)
  }

  const handleNewSession = () => {
    // Mock new session creation
    toast({
      title: "New session created",
      description: "Start asking questions about your documents.",
    })
    setShowChatInterface(true)
  }

  const handleDeletePDF = (pdfId: string) => {
    toast({
      title: "PDF removed",
      description: "The document has been deleted from your library.",
    })
  }

  const handleDeleteSession = (sessionId: string) => {
    toast({
      title: "Session deleted", 
      description: "The conversation has been removed.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Manage your documents and chat sessions from your dashboard.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="notebook-panel">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total PDFs</p>
                  <p className="text-2xl font-bold">{mockPDFs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="notebook-panel">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chat Sessions</p>
                  <p className="text-2xl font-bold">{mockSessions.length}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="notebook-panel">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Languages</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Languages className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="pdfs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pdfs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDFs
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </TabsTrigger>
          </TabsList>

          {/* PDFs Tab */}
          <TabsContent value="pdfs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your PDF Library</h2>
              <div className="relative">
                <Button className="hero-gradient">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF
                </Button>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  multiple
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPDFs.map((pdf) => (
                <motion.div
                  key={pdf.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="notebook-panel hover-lift">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <FileText className="h-8 w-8 text-primary" />
                        <Badge variant="outline">{pdf.language}</Badge>
                      </div>
                      <CardTitle className="text-lg truncate">{pdf.name}</CardTitle>
                      <CardDescription>
                        {pdf.pages} pages • {pdf.size}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        {pdf.uploadDate.toLocaleDateString()}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePDFView(pdf.id)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePDF(pdf.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chat Sessions</h2>
              <Button onClick={handleNewSession} className="hero-gradient">
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="notebook-panel hover-lift">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <MessageCircle className="h-8 w-8 text-accent" />
                        <Badge variant="outline">{session.messagesCount} messages</Badge>
                      </div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription>
                        Created {session.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Clock className="h-4 w-4 mr-2" />
                        Last activity: {session.lastActivity.toLocaleTimeString()}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSessionView(session.id)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Chat
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* New Chat Tab */}
          <TabsContent value="chat">
            <Card className="notebook-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Start a New Conversation
                </CardTitle>
                <CardDescription>
                  Ask questions about your uploaded PDFs and get AI-powered answers with source references.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ChatInterface />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* PDF Viewer Modal */}
      <Dialog open={showPDFViewer} onOpenChange={setShowPDFViewer}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>PDF Viewer</DialogTitle>
            <DialogDescription>
              Preview your document with language detection and translation features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1">
            <PDFViewer file="/sample.pdf" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Interface Modal */}
      <Dialog open={showChatInterface} onOpenChange={setShowChatInterface}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat Session</DialogTitle>
            <DialogDescription>
              Ask questions about your documents and get detailed answers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1">
            <ChatInterface />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Dashboard